/* ==============================
   SCRIPT.JS — Player
   ============================== */

(function () {

    const audio     = document.getElementById('audio');
    const btnPlay   = document.getElementById('btn-play');
    const iconPlay  = document.getElementById('icon-play');
    const iconPause = document.getElementById('icon-pause');
    const btnMute   = document.getElementById('btn-mute');
    const iconVol   = document.getElementById('icon-vol');
    const iconMuted = document.getElementById('icon-muted');
    const volSlider = document.getElementById('vol');
    const prog      = document.getElementById('prog');
    const disc      = document.getElementById('vinyl-disc');
    const corner    = document.getElementById('player-corner');
    const toast     = document.getElementById('toast');

    let isPlaying = false;
    let isMuted   = true;   // começa mudo para garantir autoplay
    let lastVol   = 0.8;

    /* ── Fill do range ── */
    function fill(input, val, min, max) {
        const pct = ((val - min) / (max - min)) * 100;
        input.style.background =
            `linear-gradient(to right,rgba(255,255,255,.72) ${pct}%,rgba(255,255,255,.15) ${pct}%)`;
    }

    /* ── Play / Pause ── */
    function setPlaying(play) {
        isPlaying = play;
        if (play) {
            audio.play().catch(() => {});
            iconPlay.classList.add('hidden');
            iconPause.classList.remove('hidden');
            disc.style.animationPlayState = 'running';
        } else {
            audio.pause();
            iconPlay.classList.remove('hidden');
            iconPause.classList.add('hidden');
            disc.style.animationPlayState = 'paused';
        }
    }

    btnPlay.addEventListener('click', () => setPlaying(!isPlaying));

    /* ── Mute toggle ── */
    function setMuted(muted) {
        isMuted = muted;
        audio.muted = muted;
        if (muted) {
            iconVol.classList.add('hidden');
            iconMuted.classList.remove('hidden');
            fill(volSlider, 0, 0, 1);
        } else {
            iconVol.classList.remove('hidden');
            iconMuted.classList.add('hidden');
            audio.volume = lastVol;
            volSlider.value = lastVol;
            fill(volSlider, lastVol, 0, 1);
        }
    }

    btnMute.addEventListener('click', () => setMuted(!isMuted));

    /* ── Volume ── */
    volSlider.addEventListener('input', e => {
        const v = parseFloat(e.target.value);
        audio.volume = v;
        lastVol = v;
        fill(volSlider, v, 0, 1);
        if (v > 0 && isMuted) setMuted(false);
        if (v === 0)           setMuted(true);
    });

    /* ── Progresso ── */
    audio.addEventListener('timeupdate', () => {
        if (!audio.duration) return;
        const pct = (audio.currentTime / audio.duration) * 100;
        prog.value = pct;
        fill(prog, pct, 0, 100);
    });

    prog.addEventListener('input', e => {
        if (!audio.duration) return;
        audio.currentTime = (parseFloat(e.target.value) / 100) * audio.duration;
        fill(prog, parseFloat(e.target.value), 0, 100);
    });

    /* ── Loop ── */
    audio.addEventListener('ended', () => {
        audio.currentTime = 0;
        setPlaying(true);
    });

    /* ─────────────────────────────────────────────
       AUTOPLAY UNIVERSAL — Muted Trick
       ─────────────────────────────────────────────
       Browsers permitem autoplay se o áudio estiver
       mudo. Iniciamos mudo → disco gira imediatamente.
       Na PRIMEIRA interação do usuário (qualquer clique
       ou toque) → desmutamos automaticamente.
    ──────────────────────────────────────────────── */
    audio.muted  = true;
    audio.volume = lastVol;
    fill(volSlider, 0, 0, 1);   // slider zerado visualmente (mudo)
    fill(prog, 0, 0, 100);

    // Mostra estado mudo nos ícones
    iconVol.classList.add('hidden');
    iconMuted.classList.remove('hidden');

    // Tenta autoplay mudo
    audio.play()
        .then(() => {
            isPlaying = true;
            iconPlay.classList.add('hidden');
            iconPause.classList.remove('hidden');
            disc.style.animationPlayState = 'running';
            corner.classList.add('visible');

            // Na primeira interação humana → desmuta
            const unmute = () => {
                if (isMuted) setMuted(false);
            };
            document.addEventListener('click',      unmute, { once: true });
            document.addEventListener('touchstart', unmute, { once: true });
            document.addEventListener('keydown',    unmute, { once: true });
        })
        .catch(() => {
            // Completamente bloqueado — aguarda qualquer interação
            corner.classList.add('visible');
            const start = () => {
                audio.muted = false;
                isMuted = false;
                setMuted(false);
                setPlaying(true);
            };
            document.addEventListener('click',      start, { once: true });
            document.addEventListener('touchstart', start, { once: true });
        });

})();
