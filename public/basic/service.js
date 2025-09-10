// Czeka aż cała strona się załaduje
document.addEventListener('DOMContentLoaded', function () {
    console.log('Strona załadowana! JavaScript działa!')

    // Pobieranie elementów ze strony
    const openDialogButton = document.getElementById('openDialog')
    const modal = document.getElementById('modal')
    const closeButton = document.querySelector('.close')
    const closeModalButton = document.getElementById('closeModal')

    // Funkcja otwierająca dialog
    function openModal() {
        console.log('Otwieranie dialogu...')
        modal.style.display = 'block'
        document.body.style.overflow = 'hidden' // Blokuje przewijanie strony

        // Dodaje efekt dźwiękowy (opcjonalnie)
        playClickSound()
    }

    // Funkcja zamykająca dialog
    function closeModal() {
        console.log('Zamykanie dialogu...')
        modal.style.display = 'none'
        document.body.style.overflow = 'auto' // Przywraca przewijanie
    }

    // Przypisanie funkcji do przycisków
    openDialogButton.addEventListener('click', openModal)
    closeButton.addEventListener('click', closeModal)
    closeModalButton.addEventListener('click', closeModal)

    // Zamknięcie dialogu po kliknięciu w tło
    modal.addEventListener('click', function (event) {
        if (event.target === modal) {
            closeModal()
        }
    })

    // Zamknięcie dialogu klawiszem Escape
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && modal.style.display === 'block') {
            closeModal()
        }
    })

    // Prosta funkcja symulująca dźwięk kliknięcia
    function playClickSound() {
        // Tworzy krótki beep za pomocą Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)()
            const oscillator = audioContext.createOscillator()
            const gainNode = audioContext.createGain()

            oscillator.connect(gainNode)
            gainNode.connect(audioContext.destination)

            oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)

            oscillator.start(audioContext.currentTime)
            oscillator.stop(audioContext.currentTime + 0.1)
        } catch (error) {
            console.log('Nie można odtworzyć dźwięku:', error)
        }
    }

    // Animacja kart przy przewijaniu (efekt dodatkowy)
    function animateCardsOnScroll() {
        const cards = document.querySelectorAll('.card')

        cards.forEach((card) => {
            const cardTop = card.getBoundingClientRect().top
            const cardVisible = 150

            if (cardTop < window.innerHeight - cardVisible) {
                card.style.opacity = '1'
                card.style.transform = 'translateY(0)'
            }
        })
    }

    // Inicjalizacja animacji kart
    const cards = document.querySelectorAll('.card')
    cards.forEach((card) => {
        card.style.opacity = '0'
        card.style.transform = 'translateY(30px)'
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease'
    })

    // Nasłuchiwanie przewijania
    window.addEventListener('scroll', animateCardsOnScroll)

    // Uruchomienie animacji na początku
    animateCardsOnScroll()

    // Dodatkowa funkcja: zmiana koloru tła przycisku losowo
    function randomButtonColor() {
        const button = document.getElementById('openDialog')
        const colors = [
            'linear-gradient(45deg, #4CAF50, #45a049)',
            'linear-gradient(45deg, #2196F3, #1976D2)',
            'linear-gradient(45deg, #FF9800, #F57C00)',
            'linear-gradient(45deg, #9C27B0, #7B1FA2)',
        ]

        const randomColor = colors[Math.floor(Math.random() * colors.length)]
        button.style.background = randomColor
    }

    // Zmiana koloru co 3 sekundy (opcjonalnie)
    setInterval(randomButtonColor, 3000)

    // Wyświetlenie wiadomości powitalnej
    setTimeout(() => {
        console.log('Witaj w świecie programowania! 🎮')
        console.log('Ten przykład pokazuje podstawy HTML, CSS i JavaScript')
        console.log('Spróbuj kliknąć przycisk "Rozpocznij Przygodę!"')
    }, 1000)
})
