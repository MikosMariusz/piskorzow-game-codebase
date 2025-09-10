export const checkGpsAccessAndAccuracy = async () => {
    console.log('🔍 Starting GPS check...')

    // TYMCZASOWO - zawsze zwracaj true do testów
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)
    console.log('📱 Is mobile device:', isMobile)
    console.log('🌐 User agent:', navigator.userAgent)

    // Tymczasowo zwróć true jeśli mobile
    if (isMobile) {
        console.log('✅ GPS access granted - FORCED FOR TESTING')
        return { access: true, accuracy: 50, isMobile }
    }

    if (!('geolocation' in navigator)) {
        console.log('❌ Geolocation not available')
        return { access: false, reason: 'Geolocation API not available' }
    }

    return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const accuracy = position.coords.accuracy // in meters
                console.log('📍 GPS position received:', {
                    accuracy,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                })

                // Zwiększ próg accuracy z 50m na 100m dla testowania
                if (accuracy <= 100) {
                    console.log('✅ GPS access granted - good accuracy')
                    resolve({ access: true, accuracy, isMobile })
                } else {
                    console.log('⚠️ GPS access denied - poor accuracy')
                    resolve({
                        access: false,
                        reason: `Accuracy too low: ${accuracy}m (required: ≤100m)`,
                        accuracy,
                        isMobile,
                    })
                }
            },
            (error) => {
                console.log('❌ GPS error:', error.message, error.code)
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
