import { fromLonLat } from 'ol/proj'
import { Point, Circle } from 'ol/geom'
import { Feature } from 'ol'
import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import { Style, Circle as CircleStyle, Fill, Stroke } from 'ol/style'

let _gpsWatchId = null
let _gpsLayer = null
let _gpsPositionCallback = null
let _currentPosition = null
let _positionUpdateCallback = null
let _simulationInterval = null

export const checkGpsAccessAndAccuracy = async () => {
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)

    // Jeśli nie mobilne urządzenie i środowisko dev, symuluj dostęp GPS
    if (!isMobile && import.meta.env.DEV) {
        return { access: true, accuracy: 10, isMobile }
    }

    if (!('geolocation' in navigator)) {
        return { access: false, reason: 'Geolocation API not available' }
    }

    return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const accuracy = position.coords.accuracy // in meters

                // Zwiększ próg accuracy z 50m na 100m dla testowania
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
                timeout: 10000, // zwiększ timeout do 10s
                maximumAge: 60000, // pozwól na cache przez 1 minutę
            },
        )
    })
}

/**
 * Ustawia callback wywoływany przy aktualizacji pozycji GPS
 * @param {Function} callback - Funkcja wywoływana z pozycją (lat, lon, accuracy)
 */
export const setGpsPositionCallback = (callback) => {
    _gpsPositionCallback = callback
}

/**
 * Ustawia callback wywoływany przy aktualizacji pozycji GPS dla store
 * @param {Function} callback - Funkcja wywoływana z obiektem {lat, lon, accuracy}
 */
export const setPositionUpdateCallback = (callback) => {
    _positionUpdateCallback = callback
}

/**
 * Usuwa callback pozycji GPS
 */
export const clearGpsPositionCallback = () => {
    _gpsPositionCallback = null
}

/**
 * Pobiera aktualną pozycję GPS
 * @returns {Object|null} Obiekt z lat, lon, accuracy lub null
 */
export const getCurrentPosition = () => {
    return _currentPosition
}

/**
 * Tworzy warstwę GPS na mapie
 * @param {Object} map - Instancja mapy OpenLayers
 */
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
                // Wyraźne małe kółeczko dla pozycji
                return new Style({
                    image: new CircleStyle({
                        radius: 6,
                        fill: new Fill({ color: '#2196F3' }),
                        stroke: new Stroke({ color: '#ffffff', width: 2 }),
                    }),
                })
            } else if (featureType === 'accuracy') {
                // Ledwo widoczny, bardzo przezroczysty okrąg dokładności
                return new Style({
                    fill: new Fill({ color: 'rgba(33, 150, 243, 0.05)' }),
                    stroke: new Stroke({ color: 'rgba(33, 150, 243, 0.15)', width: 1 }),
                })
            }
        },
        zIndex: 1000, // Wysoki z-index żeby był widoczny nad innymi warstwami
    })

    map.addLayer(_gpsLayer)
    return _gpsLayer
}

/**
 * Usuwa warstwę GPS z mapy
 * @param {Object} map - Instancja mapy OpenLayers
 */
export const removeGpsLayer = (map) => {
    if (_gpsLayer) {
        map.removeLayer(_gpsLayer)
        _gpsLayer = null
    }
}

/**
 * Aktualizuje pozycję GPS na mapie
 * @param {number} lat - Szerokość geograficzna
 * @param {number} lon - Długość geograficzna
 * @param {number} accuracy - Dokładność w metrach
 */
export const updateGpsPosition = (lat, lon, accuracy) => {
    if (!_gpsLayer) return

    const source = _gpsLayer.getSource()
    source.clear()

    const position = fromLonLat([lon, lat])

    // Dodaj okrąg dokładności jako pierwszy (w tle)
    const accuracyCircle = new Circle(position, accuracy)
    const accuracyFeature = new Feature({
        geometry: accuracyCircle,
        type: 'accuracy',
    })

    // Dodaj punkt pozycji jako drugi (na wierzchu)
    const positionFeature = new Feature({
        geometry: new Point(position),
        type: 'position',
    })

    // Dodaj najpierw okrąg (w tle), potem punkt (na wierzchu)
    source.addFeatures([accuracyFeature, positionFeature])

    // Zapisz aktualną pozycję
    _currentPosition = { lat, lon, accuracy }

    // Wywołaj callback jeśli istnieje
    if (_gpsPositionCallback) {
        _gpsPositionCallback(lat, lon, accuracy)
    }
}

/**
 * Rozpoczyna śledzenie pozycji GPS
 * @param {Object} map - Instancja mapy OpenLayers
 * @returns {Promise<boolean>} True jeśli udało się rozpocząć śledzenie
 */
export const startGpsTracking = async (map) => {
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)

    // Jeśli nie mobilne urządzenie i środowisko dev, uruchom symulację
    if (!isMobile && import.meta.env.DEV) {
        return startGpsSimulation(map)
    }

    if (!('geolocation' in navigator)) {
        return false
    }

    // Stwórz warstwę GPS jeśli nie istnieje
    if (!_gpsLayer) {
        createGpsLayer(map)
    }

    return new Promise((resolve) => {
        _gpsWatchId = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude, accuracy } = position.coords
                updateGpsPosition(latitude, longitude, accuracy)

                // Wywołaj callback aktualizacji pozycji jeśli jest ustawiony
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

/**
 * Zatrzymuje śledzenie pozycji GPS
 * @param {Object} map - Instancja mapy OpenLayers
 */
export const stopGpsTracking = (map) => {
    if (_gpsWatchId !== null) {
        navigator.geolocation.clearWatch(_gpsWatchId)
        _gpsWatchId = null
    }

    removeGpsLayer(map)
    _currentPosition = null
}

/**
 * Rozpoczyna symulację pozycji GPS dla środowiska deweloperskiego
 * @param {Object} map - Instancja mapy OpenLayers
 * @returns {Promise<boolean>} True jeśli symulacja została rozpoczęta
 */
export const startGpsSimulation = async (map) => {
    if (!import.meta.env.DEV) {
        console.warn('GPS simulation is only available in development mode')
        return false
    }

    if (_simulationInterval) {
        return true // już działa
    }

    // Stwórz warstwę GPS jeśli nie istnieje
    if (!_gpsLayer) {
        createGpsLayer(map)
    }

    // Spróbuj pobrać pozycję użytkownika (np. na podstawie IP)
    let lat = _currentPosition ? _currentPosition.lat : 50.5
    let lon = _currentPosition ? _currentPosition.lon : 19.5

    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                timeout: 5000,
                maximumAge: 60000,
                enableHighAccuracy: false, // Użyj mniej dokładnej metody dla IP-based
            })
        })
        lat = position.coords.latitude
        lon = position.coords.longitude
    } catch (error) {
        // Użyj domyślnej pozycji jeśli nie udało się pobrać
        console.log('Could not get user position, using default:', error.message)
    }

    // Natychmiastowa aktualizacja pierwszej pozycji (jak w prawdziwym GPS)
    updateGpsPosition(lat, lon, 10)
    if (_positionUpdateCallback) {
        _positionUpdateCallback({ lat, lon, accuracy: 10 })
    }

    _simulationInterval = setInterval(() => {
        // Nieznaczne zmiany pozycji (±0.0005 stopni ≈ 50 metrów)
        lat += (Math.random() - 0.5) * 0.001
        lon += (Math.random() - 0.5) * 0.001

        // Aktualizuj pozycję z stałą dokładnością 10m
        updateGpsPosition(lat, lon, 10)

        // Wywołaj callback aktualizacji pozycji jeśli jest ustawiony
        if (_positionUpdateCallback) {
            _positionUpdateCallback({ lat, lon, accuracy: 10 })
        }
    }, 15000) // Co 15 sekund

    return true
}

/**
 * Zatrzymuje symulację pozycji GPS
 */
export const stopGpsSimulation = () => {
    if (_simulationInterval) {
        clearInterval(_simulationInterval)
        _simulationInterval = null
    }
}
