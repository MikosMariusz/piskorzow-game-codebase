import WebGLTileLayer from 'ol/layer/WebGLTile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import Map from 'ol/Map'
import { fromLonLat, toLonLat } from 'ol/proj'
import XYZ from 'ol/source/XYZ'
import View from 'ol/View'
import { GeoJSON } from 'ol/format'
import { Style, Stroke, Fill, Icon } from 'ol/style'
import { Circle as CircleGeom, Point } from 'ol/geom'
import Feature from 'ol/Feature'
import { useAppStore } from '@/stores/app'

let _map = null
let _normalTileLayer = null
let _darkTileLayer = null
let _vectorLayer = null
let _isAnimating = false
let _zoomCallback = null
let _clickCallback = null
let _moveEndCallback = null
let _flightAnimation = null
let _isFlying = false
let _flightPoints = []
let _currentFlightIndex = 0

const DEFAULT_CENTER = fromLonLat([16.5658065, 50.736368])
const DEFAULT_ZOOM = 12
const OSM_COLOR_ANIMATION_DURATION = 700
const startView = {
    center: [16.5658065, 50.736368],
    zoom: 12,
    duration: 1000,
}

export const setInitialViewForPage = () => {
    // if (!_map) return
    // // Przerwij animację lotu jeśli aktywna
    // stopFlightAnimation()
    // // Sprawdź rozmiar ekranu (mobile: szerokość < 960px - zgodnie z Vuetify breakpoint)
    // const isMobile = window.innerWidth < 960
    // const center = isMobile ? startView.mobileCenter : startView.desktopCenter
    // const zoom = startView.zoom
    // const view = _map.getView()
    // view.animate({
    //     center: fromLonLat(center),
    //     zoom,
    //     duration: 600,
    // })
}

export const getOSMDuration = () => OSM_COLOR_ANIMATION_DURATION

const generateFlightPoints = (center, count = 10) => {
    const points = []
    const [centerLon, centerLat] = center

    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.8

        const radius = 0.03 + Math.random() * 0.09

        const lon = centerLon + Math.cos(angle) * radius
        const lat = centerLat + Math.sin(angle) * radius

        const zoomVariation = (Math.random() - 0.5) * 2
        const zoom = DEFAULT_ZOOM + zoomVariation

        points.push({
            coordinates: fromLonLat([lon, lat]),
            zoom: Math.max(8, Math.min(16, zoom)),
            duration: 4000 + Math.random() * 3000,
        })
    }

    return points
}

export const startFlightAnimation = () => {
    if (_isFlying || !_map) return

    const center = toLonLat(DEFAULT_CENTER)
    _flightPoints = generateFlightPoints(center, 10)
    _currentFlightIndex = 0
    _isFlying = true

    animateToNextFlightPoint()
}

export const stopFlightAnimation = () => {
    _isFlying = false
    _map.getView().cancelAnimations()
    if (_flightAnimation) {
        clearTimeout(_flightAnimation)
        _flightAnimation = null
    }
}

const animateToNextFlightPoint = () => {
    if (!_isFlying || !_map || _flightPoints.length === 0) return

    const point = _flightPoints[_currentFlightIndex]
    const view = _map.getView()

    view.animate(
        {
            center: point.coordinates,
            zoom: point.zoom,
            duration: point.duration,
        },
        () => {
            if (_isFlying) {
                _currentFlightIndex = (_currentFlightIndex + 1) % _flightPoints.length
                _flightAnimation = setTimeout(
                    () => {
                        animateToNextFlightPoint()
                    },
                    2000 + Math.random() * 1000,
                )
            }
        },
    )
}

export const setZoomCallback = (callback) => {
    _zoomCallback = callback
}

export const clearZoomCallback = () => {
    _zoomCallback = null
}

export const setMoveEndCallback = (callback) => {
    _moveEndCallback = callback
}

export const clearMoveEndCallback = () => {
    _moveEndCallback = null
}

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
}

export const getMapCenter = () => {
    if (_map) {
        const center = _map.getView().getCenter()
        return toLonLat(center)
    }
    return null
}

export const setClickCallback = (callback) => {
    _clickCallback = callback
}

export const clearClickCallback = () => {
    _clickCallback = null
}

export const zoomIn = () => {
    if (_map) {
        const view = _map.getView()
        const currentZoom = view.getZoom()
        view.animate({ zoom: currentZoom + 1, duration: 300 })
    }
}

export const zoomOut = () => {
    if (_map) {
        const view = _map.getView()
        const currentZoom = view.getZoom()
        view.animate({ zoom: currentZoom - 1, duration: 300 })
    }
}

export const centerMapOn = (lat, lon, zoom = null) => {
    if (_map) {
        const view = _map.getView()
        const center = fromLonLat([lon, lat])

        const animationOptions = {
            center: center,
            duration: 1000,
        }

        if (zoom !== null) {
            animationOptions.zoom = zoom
        }

        view.animate(animationOptions)
    }
}

export const centerMapWithSidebar = ({
    lat = startView.desktopCenter[1],
    lon = startView.desktopCenter[0],
    zoom = null,
    duration = 1000,
    sidebarWidthPx = 0,
}) => {
    if (!_map) return
    const view = _map.getView()
    const isMobile = window.innerWidth < 960
    const mapSize = _map.getSize()
    let center = fromLonLat([lon, lat])

    if (!isMobile && mapSize && sidebarWidthPx > 0) {
        const viewZoom = zoom !== null ? zoom : view.getZoom()
        const resolution = view.getResolutionForZoom
            ? view.getResolutionForZoom(viewZoom)
            : view.getResolution()
        const shiftMeters = (sidebarWidthPx / 2) * resolution
        let center3857 = fromLonLat([lon, lat])
        center3857[0] += shiftMeters
        center = center3857
    }

    const animationOptions = {
        center,
        duration,
    }
    if (zoom !== null) {
        animationOptions.zoom = zoom
    }
    view.animate(animationOptions)
}

export const getCurrentZoom = () => {
    if (_map) {
        return _map.getView().getZoom()
    }
    return null
}

export const getDefaultGeometry = async (geojsonPath = '/geometries/piskorzow.geojson') => {
    try {
        const response = await fetch(geojsonPath)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const geojsonData = await response.json()

        if (!geojsonData) {
            throw new Error('Pusty plik GeoJSON')
        }

        let feature = null

        if (geojsonData.type === 'Feature') {
            feature = geojsonData
        } else if (geojsonData.type === 'FeatureCollection' && geojsonData.features?.length > 0) {
            feature = geojsonData.features[0]
        } else {
            throw new Error('Nieprawidłowy format GeoJSON')
        }
        if (_map) {
            const displayName =
                feature.properties?.display_name || feature.properties?.name || 'Obszar'
            addGeometryToMap(feature.geometry, displayName, feature.properties)
        }
        return feature
    } catch (error) {
        console.error(`❌ Błąd podczas ładowania geometrii z pliku ${geojsonPath}:`, error)
        return null
    }
}

export const searchLocationGeometry = async (locationName) => {
    try {
        const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=geojson&q=${encodeURIComponent(locationName)}&polygon_geojson=1&limit=10&addressdetails=1&extratags=1`
        const response = await fetch(nominatimUrl)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        if (!data.features || data.features.length === 0) {
            console.warn(`❌ Nie znaleziono geometrii dla: "${locationName}"`)
            return null
        }

        const polygonFeatures = data.features.filter((feature) => {
            const geometry = feature.geometry
            return geometry.type === 'Polygon' || geometry.type === 'MultiPolygon'
        })

        if (polygonFeatures.length === 0) {
            console.warn(`❌ Nie znaleziono poligonów dla obrębu: "${locationName}"`)
            return null
        }

        const administrativePolygons = polygonFeatures.filter((feature) => {
            const props = feature.properties
            return (
                props.type === 'administrative' ||
                props.class === 'boundary' ||
                (props.extratags && props.extratags.admin_level)
            )
        })

        const bestFeature =
            administrativePolygons.length > 0 ? administrativePolygons[0] : polygonFeatures[0]
        const geometry = bestFeature.geometry
        const properties = bestFeature.properties

        const completeFeature = {
            type: 'Feature',
            geometry,
            properties,
        }

        if (_map) {
            addGeometryToMap(
                geometry,
                properties.display_name || properties.name || locationName,
                properties,
            )
        }

        return { geometry, properties, feature: completeFeature }
    } catch (error) {
        console.error('❌ Błąd podczas wyszukiwania geometrii obrębu:', error)
        return null
    }
}

const addGeometryToMap = (geometry, locationName, properties = {}) => {
    if (!_map) return

    if (!_vectorLayer) {
        const vectorStyle = new Style({
            stroke: new Stroke({
                color: '#c48600ff',
                width: 2,
            }),
            fill: new Fill({
                color: 'rgba(118, 79, 0, 0.36)',
            }),
        })

        _vectorLayer = new VectorLayer({
            source: new VectorSource(),
            style: vectorStyle,
        })

        _map.addLayer(_vectorLayer)
    }

    _vectorLayer.getSource().clear()

    let newFeatures = []

    if (geometry.type === 'Point') {
        const center = fromLonLat(geometry.coordinates)
        if (properties.radius) {
            // Circle
            const radius = properties.radius
            const circleGeom = new CircleGeom(center, radius)
            const olFeature = new Feature(circleGeom)
            olFeature.setProperties({
                name: locationName,
                ...properties,
            })
            newFeatures = [olFeature]
        } else {
            const olFeature = new Feature({ geometry: new Point(center) })
            olFeature.setProperties({
                name: locationName,
                ...properties,
            })
            olFeature.setStyle(
                new Style({
                    image: new Icon({
                        anchor: [0.5, 1],
                        anchorXUnits: 'fraction',
                        anchorYUnits: 'fraction',
                        src: '/images/pointer.png',
                        scale: 1,
                    }),
                }),
            )
            newFeatures = [olFeature]
        }
    } else {
        // Standardowe GeoJSON
        const feature = {
            type: 'Feature',
            geometry: geometry,
            properties: {
                name: locationName,
                ...properties,
            },
        }

        const geojsonObject = {
            type: 'FeatureCollection',
            features: [feature],
        }

        newFeatures = new GeoJSON().readFeatures(geojsonObject, {
            featureProjection: 'EPSG:3857',
        })
    }

    _vectorLayer.getSource().addFeatures(newFeatures)
}

export const createMap = (targetEl, options = {}) => {
    if (_map) {
        if (targetEl) {
            _map.setTarget(targetEl)
        }
        return _map
    }

    _normalTileLayer = new WebGLTileLayer({
        source: new XYZ({
            url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            maxZoom: 19,
        }),
    })

    _darkTileLayer = new WebGLTileLayer({
        source: new XYZ({
            url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            maxZoom: 19,
        }),
        style: {
            color: [
                'array',
                [
                    '*',
                    [
                        '+',
                        ['*', ['band', 1], 0.299],
                        ['*', ['band', 2], 0.587],
                        ['*', ['band', 3], 0.114],
                    ],
                    0.6,
                ],
                [
                    '*',
                    [
                        '+',
                        ['*', ['band', 1], 0.299],
                        ['*', ['band', 2], 0.587],
                        ['*', ['band', 3], 0.114],
                    ],
                    0.6,
                ],
                [
                    '*',
                    [
                        '+',
                        ['*', ['band', 1], 0.299],
                        ['*', ['band', 2], 0.587],
                        ['*', ['band', 3], 0.114],
                    ],
                    0.6,
                ],
                ['band', 4],
            ],
        },
        opacity: 0,
    })

    _map = new Map({
        target: targetEl || undefined,
        layers: [_normalTileLayer, _darkTileLayer],
        view: new View({
            center: options.center || DEFAULT_CENTER,
            zoom: options.zoom ?? DEFAULT_ZOOM,
        }),
        controls: [],
    })

    setTimeout(() => animateToMode(), 100)

    _map.on('click', (event) => {
        if (_clickCallback && event.coordinate) {
            const [lon, lat] = toLonLat(event.coordinate)
            _clickCallback(lat, lon)
        }
    })

    _map.on('moveend', (event) => {
        if (_moveEndCallback) {
            const center = getMapCenter()
            const zoom = getCurrentZoom()
            _moveEndCallback(center, zoom)
        }
        if (_clickCallback && _map) {
            const center = _map.getView().getCenter()
            if (center) {
                const [lon, lat] = toLonLat(center)
                _clickCallback(lat, lon)
            }
        }
    })

    _map.on('moveend', () => {
        if (_moveEndCallback) {
            const center = getMapCenter()
            const zoom = getCurrentZoom()
            _moveEndCallback(center, zoom)
        }
    })

    return _map
}

export const loadDefaultGeometry = async () => {
    const feature = await getDefaultGeometry()
    if (feature && feature.geometry && _map) {
        const displayName = feature.properties?.display_name || feature.properties?.name || 'Obszar'
        addGeometryToMap(feature.geometry, displayName, feature.properties)
    }
}

export const detach = () => {
    stopFlightAnimation()
    if (_map) {
        _map.setTarget(null)
    }
}

export const setTarget = (targetEl) => {
    if (_map) {
        _map.setTarget(targetEl)
    } else {
        createMap(targetEl)
    }
}

export const updateSize = () => {
    if (_map) {
        _map.updateSize()
    }
}

export const animateToMode = (opts = {}) => {
    const appStore = useAppStore()
    const duration = OSM_COLOR_ANIMATION_DURATION
    const { forceDark = null, forceFlight = null, setStartView = true } = opts

    if (!_normalTileLayer || !_darkTileLayer) {
        return
    }

    let isDark = appStore.homePageActive
    if (forceDark !== null) isDark = forceDark

    let shouldFlight = isDark
    if (forceFlight !== null) shouldFlight = forceFlight

    const currentNormalOpacity = _normalTileLayer.getOpacity()
    const currentDarkOpacity = _darkTileLayer.getOpacity()
    const isCurrentlyDark = currentDarkOpacity > currentNormalOpacity
    if (isCurrentlyDark === isDark) {
        if (shouldFlight && !_isFlying) {
            startFlightAnimation()
        } else if (!shouldFlight && _isFlying) {
            stopFlightAnimation()
        }
        return
    }

    if (_isAnimating) {
        return
    }

    _isAnimating = true
    const startTime = Date.now()

    if (shouldFlight) {
        setTimeout(() => {
            startFlightAnimation()
        }, duration + 100)
    } else {
        stopFlightAnimation()
    }

    const startNormalOpacity = isDark ? 1 : 0
    const endNormalOpacity = isDark ? 0 : 1
    const startDarkOpacity = isDark ? 0 : 1
    const endDarkOpacity = isDark ? 1 : 0

    const animateOpacity = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)

        const eased =
            progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2

        const currentNormal = startNormalOpacity + (endNormalOpacity - startNormalOpacity) * eased
        const currentDark = startDarkOpacity + (endDarkOpacity - startDarkOpacity) * eased

        _normalTileLayer.setOpacity(currentNormal)
        _darkTileLayer.setOpacity(currentDark)

        if (progress < 1) {
            requestAnimationFrame(animateOpacity)
        } else {
            _isAnimating = false
            _normalTileLayer.setOpacity(endNormalOpacity)
            _darkTileLayer.setOpacity(endDarkOpacity)
        }
    }
    requestAnimationFrame(animateOpacity)
}

export const setStoryView = ({ features, feature, view = startView, sidebarWidthPx = 500 }) => {
    if (_isFlying) {
        stopFlightAnimation()
    }
    if (!_map) return
    if (_vectorLayer) {
        _vectorLayer.getSource().clear()
    }
    setTimeout(() => {
        if (view && view.center) {
            centerMapWithSidebar({
                lat: view.center[1],
                lon: view.center[0],
                zoom: view.zoom || null,
                duration: view.duration || null,
                sidebarWidthPx,
            })
        }
        if (feature && feature.geometry) {
            addGeometryToMap(
                feature.geometry,
                feature.properties?.name || 'Obszar',
                feature.properties,
            )
        }
        if (features && Array.isArray(features)) {
            features.forEach((feat) => {
                if (feat && feat.geometry) {
                    addGeometryToMap(
                        feat.geometry,
                        feat.properties?.name || 'Obszar',
                        feat.properties,
                    )
                }
            })
        }
    }, 200)
}
