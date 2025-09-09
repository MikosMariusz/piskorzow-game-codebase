import TileLayer from 'ol/layer/Tile'
import Map from 'ol/Map'
import { fromLonLat } from 'ol/proj'
import XYZ from 'ol/source/XYZ'
import View from 'ol/View'
import { useAppStore } from '@/stores/app'

let _map = null
let _tileLayer = null
let _isAnimating = false

const DEFAULT_CENTER = fromLonLat([16.62, 50.69])
const DEFAULT_ZOOM = 12
const OSM_COLOR_ANIMATION_DURATION = 700

export const getOSMDuration = () => OSM_COLOR_ANIMATION_DURATION

const findCanvas = () => {
    if (!_tileLayer) return null
    const mapElement = _map.getTarget()
    if (mapElement) {
        const canvasElements = mapElement.querySelectorAll('canvas')
        if (canvasElements.length > 0) {
            return canvasElements[0]
        }
    }
    return null
}

export const createMap = (targetEl, options = {}) => {
    if (_map) {
        if (targetEl) {
            _map.setTarget(targetEl)
        }
        return _map
    }
    _tileLayer = new TileLayer({
        source: new XYZ({
            url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            maxZoom: 20,
        }),
    })
    _map = new Map({
        target: targetEl || undefined,
        layers: [_tileLayer],
        view: new View({
            center: options.center || DEFAULT_CENTER,
            zoom: options.zoom ?? DEFAULT_ZOOM,
        }),
        controls: [],
    })
    setTimeout(() => animateToMode(), 100)
    return _map
}

export const detach = () => {
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

export const animateToMode = () => {
    const appStore = useAppStore()
    const isDark = appStore.darkEnabled
    const duration = OSM_COLOR_ANIMATION_DURATION

    if (!_tileLayer) {
        return
    }

    const canvas = findCanvas()
    if (!canvas) {
        return
    }

    const currentFilter = canvas.style.filter
    const isCurrentlyDark =
        currentFilter.includes('grayscale') && currentFilter.includes('brightness')

    if (isCurrentlyDark === isDark) {
        return
    }

    if (_isAnimating) {
        return
    }

    _isAnimating = true
    const startTime = Date.now()
    const startGrayscale = isCurrentlyDark ? 90 : 0
    const endGrayscale = isDark ? 90 : 0
    const startBrightness = isCurrentlyDark ? 0.3 : 1.0
    const endBrightness = isDark ? 0.3 : 1.0

    const animateFilters = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const eased =
            progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2
        const currentGrayscale = startGrayscale + (endGrayscale - startGrayscale) * eased
        const currentBrightness = startBrightness + (endBrightness - startBrightness) * eased

        if (progress < 1) {
            canvas.style.filter = `grayscale(${currentGrayscale}%) brightness(${currentBrightness}) contrast(1.2)`
            requestAnimationFrame(animateFilters)
        } else {
            _isAnimating = false
            if (isDark) {
                canvas.style.filter = 'grayscale(90%) brightness(0.3) contrast(1.2)'
            } else {
                canvas.style.filter = 'none'
            }
        }
    }
    requestAnimationFrame(animateFilters)
}
