export const checkGpsAccessAndAccuracy = async () => {
    if (!('geolocation' in navigator)) {
        return { access: false, reason: 'Geolocation API not available' }
    }

    const isMobile = /Mobi|Android/i.test(navigator.userAgent)

    return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const accuracy = position.coords.accuracy // in meters
                if (accuracy <= 50) {
                    resolve({ access: true, accuracy, isMobile })
                } else {
                    resolve({
                        access: false,
                        reason: `Accuracy too low: ${accuracy}m`,
                        accuracy,
                        isMobile,
                    })
                }
            },
            (error) => {
                resolve({ access: false, reason: error.message, isMobile })
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
        )
    })
}
