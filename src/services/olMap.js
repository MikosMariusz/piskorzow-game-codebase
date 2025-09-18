import WebGLTileLayer from 'ol/layer/WebGLTile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import Map from 'ol/Map'
import { fromLonLat, toLonLat } from 'ol/proj'
import XYZ from 'ol/source/XYZ'
import View from 'ol/View'
import { GeoJSON } from 'ol/format'
import { Style, Stroke, Fill } from 'ol/style'
import { useAppStore } from '@/stores/app'

let _map = null
let _normalTileLayer = null
let _darkTileLayer = null
let _vectorLayer = null
let _isAnimating = false
let _zoomCallback = null
let _clickCallback = null
let _moveEndCallback = null

// Zmienne dla animacji lotu na stronie głównej
let _flightAnimation = null
let _isFlying = false
let _flightPoints = []
let _currentFlightIndex = 0

const DEFAULT_CENTER = fromLonLat([16.561, 50.733])
const DEFAULT_ZOOM = 12
const OSM_COLOR_ANIMATION_DURATION = 700
const startView = {
    mobileCenter: [16.560542, 50.668472],
    desktopCenter: [16.617904, 50.736058],
    zoom: 12,
}

/**
 * Ustawia widok mapy na początkowy dla podstron (game, presentation) z uwzględnieniem rozmiaru ekranu
 * Przerywa animację lotu jeśli aktywna
 */
export const setInitialViewForPage = () => {
    if (!_map) return
    // Przerwij animację lotu jeśli aktywna
    stopFlightAnimation()

    // Sprawdź rozmiar ekranu (mobile: szerokość < 960px - zgodnie z Vuetify breakpoint)
    const isMobile = window.innerWidth < 960
    const center = isMobile ? startView.mobileCenter : startView.desktopCenter
    const zoom = startView.zoom
    const view = _map.getView()
    view.animate({
        center: fromLonLat(center),
        zoom,
        duration: 600,
    })
}

export const getOSMDuration = () => OSM_COLOR_ANIMATION_DURATION

/**
 * Generuje losowe punkty wokół centrum mapy dla animacji lotu
 * @param {Array} center - Współrzędne centrum [lon, lat]
 * @param {number} count - Liczba punktów do wygenerowania
 * @returns {Array} Tablica punktów z współrzędnymi i poziomami zoom
 */
const generateFlightPoints = (center, count = 10) => {
    const points = []
    const [centerLon, centerLat] = center

    for (let i = 0; i < count; i++) {
        // Losowy kąt w radianach - większe rozłożenie
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.8

        // Większy promień dla lotu po regionie (0.03 - 0.12 stopni, około 3-12km)
        const radius = 0.03 + Math.random() * 0.09

        // Oblicz współrzędne punktu
        const lon = centerLon + Math.cos(angle) * radius
        const lat = centerLat + Math.sin(angle) * radius

        // Bardzo minimalny zakres zoom (DEFAULT_ZOOM +-1)
        const zoomVariation = (Math.random() - 0.5) * 2 // -1 do +1
        const zoom = DEFAULT_ZOOM + zoomVariation

        points.push({
            coordinates: fromLonLat([lon, lat]),
            zoom: Math.max(8, Math.min(16, zoom)), // Ograniczenie do sensownego zakresu
            duration: 4000 + Math.random() * 3000, // 4-7 sekund na punkt dla spokojniejszego lotu
        })
    }

    return points
}

/**
 * Uruchamia animację lotu po losowych punktach
 */
export const startFlightAnimation = () => {
    if (_isFlying || !_map) return

    const center = toLonLat(DEFAULT_CENTER)
    _flightPoints = generateFlightPoints(center, 10) // Więcej punktów dla płynniejszego lotu
    _currentFlightIndex = 0
    _isFlying = true

    animateToNextFlightPoint()
}

/**
 * Zatrzymuje animację lotu
 */
export const stopFlightAnimation = () => {
    _isFlying = false
    if (_flightAnimation) {
        clearTimeout(_flightAnimation)
        _flightAnimation = null
    }
}

/**
 * Animuje do następnego punktu w sekwencji lotu
 */
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
            // Po zakończeniu animacji do tego punktu, przejdź do następnego
            if (_isFlying) {
                _currentFlightIndex = (_currentFlightIndex + 1) % _flightPoints.length

                // Dłuższa pauza między punktami dla spokojniejszego lotu (2-3 sekundy)
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

/**
 * Rejestruje callback do aktualizacji poziomu zoom
 * @param {Function} callback - Funkcja wywoływana przy zmianie poziomu zoom
 */
export const setZoomCallback = (callback) => {
    _zoomCallback = callback
}

/**
 * Usuwa callback zoom
 */
export const clearZoomCallback = () => {
    _zoomCallback = null
}

/**
 * Rejestruje callback do obsługi zakończenia ruchu mapy
 * @param {Function} callback - Funkcja wywoływana po zakończeniu ruchu mapy (center, zoom)
 */
export const setMoveEndCallback = (callback) => {
    _moveEndCallback = callback
}

/**
 * Usuwa callback ruchu mapy
 */
export const clearMoveEndCallback = () => {
    _moveEndCallback = null
}

/**
 * Oblicza dystans między dwoma punktami geograficznymi w metrach (wzór Haversine)
 * @param {number} lat1 - Szerokość geograficzna pierwszego punktu
 * @param {number} lon1 - Długość geograficzna pierwszego punktu
 * @param {number} lat2 - Szerokość geograficzna drugiego punktu
 * @param {number} lon2 - Długość geograficzna drugiego punktu
 * @returns {number} Dystans w metrach
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000 // Promień Ziemi w metrach
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

/**
 * Pobiera aktualne centrum mapy w współrzędnych geograficznych
 * @returns {Array|null} [lon, lat] lub null jeśli mapa nie istnieje
 */
export const getMapCenter = () => {
    if (_map) {
        const center = _map.getView().getCenter()
        return toLonLat(center)
    }
    return null
}

/**
 * Rejestruje callback do obsługi kliknięć na mapie
 * @param {Function} callback - Funkcja wywoływana przy kliknięciu na mapę
 */
export const setClickCallback = (callback) => {
    _clickCallback = callback
}

/**
 * Usuwa callback kliknięć
 */
export const clearClickCallback = () => {
    _clickCallback = null
}

/**
 * Przybliża mapę o jeden poziom
 */
export const zoomIn = () => {
    if (_map) {
        const view = _map.getView()
        const currentZoom = view.getZoom()
        view.animate({ zoom: currentZoom + 1, duration: 300 })
    }
}

/**
 * Oddala mapę o jeden poziom
 */
export const zoomOut = () => {
    if (_map) {
        const view = _map.getView()
        const currentZoom = view.getZoom()
        view.animate({ zoom: currentZoom - 1, duration: 300 })
    }
}

/**
 * Centruje mapę na podanych współrzędnych z animacją
 * @param {number} lat - Szerokość geograficzna
 * @param {number} lon - Długość geograficzna
 * @param {number} zoom - Poziom przybliżenia (opcjonalny)
 */
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

/**
 * Pobiera aktualny poziom zoom
 * @returns {number|null} Aktualny poziom zoom lub null jeśli mapa nie istnieje
 */
export const getCurrentZoom = () => {
    if (_map) {
        return _map.getView().getZoom()
    }
    return null
}

/**
 * Ładuje geometrię z lokalnego pliku GeoJSON
 * @param {string} geojsonPath - Ścieżka do pliku GeoJSON (względem public/)
 * @returns {Promise<Object|null>} GeoJSON feature lub null w przypadku błędu
 */
export const loadGeometryFromFile = async (geojsonPath) => {
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

export const clearGeometry = () => {
    if (_map && _vectorLayer) {
        _map.removeLayer(_vectorLayer)
        _vectorLayer = null
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

        // Filtruj tylko poligony
        const polygonFeatures = data.features.filter((feature) => {
            const geometry = feature.geometry
            return geometry.type === 'Polygon' || geometry.type === 'MultiPolygon'
        })

        if (polygonFeatures.length === 0) {
            console.warn(`❌ Nie znaleziono poligonów dla obrębu: "${locationName}"`)
            return null
        }

        // Preferuj poligony administracyjne
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
    if (_vectorLayer) {
        _map.removeLayer(_vectorLayer)
    }
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

    const vectorSource = new VectorSource({
        features: new GeoJSON().readFeatures(geojsonObject, {
            featureProjection: 'EPSG:3857',
        }),
    })

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
        source: vectorSource,
        style: vectorStyle,
    })

    _map.addLayer(_vectorLayer)
}

export const createMap = (targetEl, options = {}) => {
    if (_map) {
        if (targetEl) {
            _map.setTarget(targetEl)
        }
        return _map
    }

    // Warstwa normalna (kolorowa)
    _normalTileLayer = new WebGLTileLayer({
        source: new XYZ({
            url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            maxZoom: 20,
        }),
    })

    // Warstwa ciemna (wyszarzona z rozjaśnioną jasnością)
    _darkTileLayer = new WebGLTileLayer({
        source: new XYZ({
            url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            maxZoom: 20,
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

    // Usunięcie niepotrzebnego timeout i funkcji findLayerCanvas

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

    // Aktualizuj współrzędne również po przesunięciu mapy (np. drag na desktopie i dotyku)
    _map.on('moveend', (event) => {
        if (_moveEndCallback) {
            const center = getMapCenter()
            const zoom = getCurrentZoom()
            _moveEndCallback(center, zoom)
        }
        // Dla UX: po każdym przesunięciu mapy aktualizuj współrzędne na środku mapy
        if (_clickCallback && _map) {
            const center = _map.getView().getCenter()
            if (center) {
                const [lon, lat] = toLonLat(center)
                _clickCallback(lat, lon)
            }
        }
    })

    // Nasłuchiwanie na zakończenie ruchu mapy
    _map.on('moveend', () => {
        if (_moveEndCallback) {
            const center = getMapCenter()
            const zoom = getCurrentZoom()
            _moveEndCallback(center, zoom)
        }
    })

    const geometryFile =
        options.geometryFile !== undefined ? options.geometryFile : '/geometries/piskorzow.geojson'
    if (geometryFile) {
        setTimeout(() => {
            loadGeometryFromFile(geometryFile)
        }, 200)
    }

    // Test method for development - uncomment to test Nominatim search
    // searchLocationGeometry('Nazwa lokalizacji')

    return _map
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

/**
 * Ustawia filtr mapy (ciemny/normalny), animację lotu i pozycję startową w zależności od parametrów i rozmiaru ekranu.
 * @param {Object} opts
 *   - forceDark: wymuś ciemny filtr (np. /game bez GPS)
 *   - forceFlight: wymuś animację lotu (np. /game bez GPS)
 *   - setStartView: ustaw pozycję startową (domyślnie true)
 */
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
    if (setStartView) {
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 960
        const center = isMobile ? startView.mobileCenter : startView.desktopCenter
        const zoom = startView.zoom
        const view = _map?.getView()
        if (view) {
            view.animate({
                center: fromLonLat(center),
                zoom,
                duration: 600,
            })
        }
    }

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
