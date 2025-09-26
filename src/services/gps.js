import { fromLonLat } from 'ol/proj'
import { Point, Circle } from 'ol/geom'
import { Feature } from 'ol'
import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import { Style, Circle as CircleStyle, Fill, Stroke } from 'ol/style'

let _heading = null
let _bearingToTarget = null
let _directionCallback = null
let _headingListener = null

export const setDirectionCallback = (cb) => {
    _directionCallback = cb
}

function calculateBearing(from, to) {
    const toRad = (deg) => (deg * Math.PI) / 180
    const toDeg = (rad) => (rad * 180) / Math.PI

    const lat1 = toRad(from[1])
    const lon1 = toRad(from[0])
    const lat2 = toRad(to[1])
    const lon2 = toRad(to[0])

    const dLon = lon2 - lon1
    const y = Math.sin(dLon) * Math.cos(lat2)
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon)
    let brng = Math.atan2(y, x)
    brng = toDeg(brng)
    return (brng + 360) % 360
}

export const startHeadingTracking = (targetLonLat) => {
    if (_headingListener) return
    _headingListener = (event) => {
        let heading = null
        if (typeof event.webkitCompassHeading === 'number') {
            heading = event.webkitCompassHeading
        } else if (event.absolute && typeof event.alpha === 'number') {
            heading = 360 - event.alpha
        } else if (typeof event.alpha === 'number') {
            heading = 360 - event.alpha
        }
        if (typeof heading !== 'number' || isNaN(heading)) return
        _heading = heading
        if (_currentPosition && targetLonLat) {
            const from = [_currentPosition.lon, _currentPosition.lat]
            const to = targetLonLat
            _bearingToTarget = calculateBearing(from, to)
            const arrowAngle = (_bearingToTarget - _heading + 360) % 360
            if (_directionCallback) {
                _directionCallback({ heading: _heading, bearing: _bearingToTarget, arrowAngle })
            }
        }
    }
    window.addEventListener('deviceorientationabsolute', _headingListener, true)
    window.addEventListener('deviceorientation', _headingListener, true)
}

export const stopHeadingTracking = () => {
    if (_headingListener) {
        window.removeEventListener('deviceorientationabsolute', _headingListener, true)
        window.removeEventListener('deviceorientation', _headingListener, true)
        _headingListener = null
    }
    _heading = null
    _bearingToTarget = null
    _directionCallback = null
}

let _gpsWatchId = null
let _gpsLayer = null
let _gpsPositionCallback = null
let _currentPosition = null
let _positionUpdateCallback = null
let _simulationInterval = null
let _simulateGPS = false

export const checkGpsAccessAndAccuracy = async () => {
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)

    if (!isMobile && import.meta.env.DEV && _simulateGPS) {
        return { access: true, accuracy: 10, isMobile }
    }

    if (!('geolocation' in navigator)) {
        return { access: false, reason: 'Geolocation API not available' }
    }

    return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const accuracy = position.coords.accuracy

                if (accuracy <= 100) {
                    resolve({ access: true, accuracy, isMobile })
                } else {
                    resolve({
                        access: false,
                        reason: `Accuracy too low: ${accuracy}m (required: ≤100m)`,
                        accuracy,
                        isMobile,
                    })
                }
            },
            (error) => {
                resolve({ access: false, reason: error.message, isMobile, error: error.code })
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000,
            },
        )
    })
}

export const setGpsPositionCallback = (callback) => {
    _gpsPositionCallback = callback
}

export const setPositionUpdateCallback = (callback) => {
    _positionUpdateCallback = callback
}

export const clearGpsPositionCallback = () => {
    _gpsPositionCallback = null
}

export const getCurrentPosition = () => {
    return _currentPosition
}

export const createGpsLayer = (map) => {
    if (_gpsLayer) {
        map.removeLayer(_gpsLayer)
    }

    const vectorSource = new VectorSource()

    _gpsLayer = new VectorLayer({
        source: vectorSource,
        style: (feature) => {
            const featureType = feature.get('type')

            if (featureType === 'position') {
                return new Style({
                    image: new CircleStyle({
                        radius: 6,
                        fill: new Fill({ color: '#2196F3' }),
                        stroke: new Stroke({ color: '#ffffff', width: 2 }),
                    }),
                })
            } else if (featureType === 'accuracy') {
                return new Style({
                    fill: new Fill({ color: 'rgba(33, 150, 243, 0.05)' }),
                    stroke: new Stroke({ color: 'rgba(33, 150, 243, 0.15)', width: 1 }),
                })
            }
        },
        zIndex: 1000,
    })

    map.addLayer(_gpsLayer)
    return _gpsLayer
}

export const removeGpsLayer = (map) => {
    if (_gpsLayer) {
        map.removeLayer(_gpsLayer)
        _gpsLayer = null
    }
}

export const updateGpsPosition = (lat, lon, accuracy) => {
    if (!_gpsLayer) return

    const source = _gpsLayer.getSource()
    source.clear()

    const position = fromLonLat([lon, lat])

    const accuracyCircle = new Circle(position, accuracy)
    const accuracyFeature = new Feature({
        geometry: accuracyCircle,
        type: 'accuracy',
    })

    const positionFeature = new Feature({
        geometry: new Point(position),
        type: 'position',
    })

    source.addFeatures([accuracyFeature, positionFeature])

    _currentPosition = { lat, lon, accuracy }

    if (_gpsPositionCallback) {
        _gpsPositionCallback(lat, lon, accuracy)
    }
}

export const startGpsTracking = async (map) => {
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)

    if (!isMobile && import.meta.env.DEV && _simulateGPS) {
        return startGpsSimulation(map)
    }

    if (!('geolocation' in navigator)) {
        return false
    }

    if (!_gpsLayer) {
        createGpsLayer(map)
    }

    return new Promise((resolve) => {
        _gpsWatchId = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude, accuracy } = position.coords
                updateGpsPosition(latitude, longitude, accuracy)

                if (_positionUpdateCallback) {
                    _positionUpdateCallback({ lat: latitude, lon: longitude, accuracy })
                }

                resolve(true)
            },
            (error) => {
                console.error('GPS tracking error:', error)
                resolve(false)
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 5000,
            },
        )
    })
}

export const stopGpsTracking = (map) => {
    if (_gpsWatchId !== null) {
        navigator.geolocation.clearWatch(_gpsWatchId)
        _gpsWatchId = null
    }

    removeGpsLayer(map)
    _currentPosition = null
}

export const startGpsSimulation = async (map) => {
    if (!import.meta.env.DEV) {
        console.warn('GPS simulation is only available in development mode')
        return false
    }

    if (_simulationInterval) {
        return true
    }

    if (!_gpsLayer) {
        createGpsLayer(map)
    }

    let lat = _currentPosition ? _currentPosition.lat : 50.5
    let lon = _currentPosition ? _currentPosition.lon : 19.5

    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                timeout: 5000,
                maximumAge: 60000,
                enableHighAccuracy: false,
            })
        })
        lat = position.coords.latitude
        lon = position.coords.longitude
    } catch (error) {
        console.log('Could not get user position, using default:', error.message)
    }

    updateGpsPosition(lat, lon, 10)
    if (_positionUpdateCallback) {
        _positionUpdateCallback({ lat, lon, accuracy: 10 })
    }

    _simulationInterval = setInterval(() => {
        lat += (Math.random() - 0.5) * 0.001
        lon += (Math.random() - 0.5) * 0.001

        updateGpsPosition(lat, lon, 10)

        if (_positionUpdateCallback) {
            _positionUpdateCallback({ lat, lon, accuracy: 10 })
        }
    }, 15000)

    return true
}

export const stopGpsSimulation = () => {
    if (_simulationInterval) {
        clearInterval(_simulationInterval)
        _simulationInterval = null
    }
}
