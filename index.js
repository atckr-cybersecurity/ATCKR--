/* JavaScript file for the animations in 'index.html' (partly created through Claude) */


const phrases = [
            'detecting: phishing attempt...',
            'scanning: malware signature...',
            'blocking: unauthorized access...',
            'encrypting: your data...',
            'updating: firewall rules...',
            'alert: spyware detected. neutralizing...'
        ];

        let phraseIndex = 0;
        let charIndex   = 0;
        let deleting    = false;
        const el        = document.getElementById('typed');
        const speed     = { type: 55, delete: 28, pause: 1800 };

        function type() {
            const current = phrases[phraseIndex];

            if (!deleting) {
                el.textContent = current.slice(0, charIndex + 1);
                charIndex++;
                if (charIndex === current.length) {
                    deleting = true;
                    setTimeout(type, speed.pause);
                    return;
                }
            } else {
                el.textContent = current.slice(0, charIndex - 1);
                charIndex--;
                if (charIndex === 0) {
                    deleting = false;
                    phraseIndex = (phraseIndex + 1) % phrases.length;
                }
            }

            setTimeout(type, deleting ? speed.delete : speed.type);
        }

        type();

    