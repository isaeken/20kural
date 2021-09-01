const $ = window.$ = require('jquery');
const ipcRenderer = require('electron').ipcRenderer;

$(document).ready(function () {
    $('#btn_close').click(function () {
        ipcRenderer.send('hide');
    });

    $('#open_at_login').click(function () {
        ipcRenderer.send('open_at_login');
    });

    let time = 0;
    let paused = true;
    let status = 0;
    let breaks = 0;
    let skips = 0;

    let element_minutes = $('#minutes');
    let element_seconds = $('#seconds');
    let element_status = $('#status');
    let element_breaks_count = $('#breaks_count');
    let element_skips = $('#element_skips');
    let element_health_status = $('#health_status');
    let element_breaks = $('#breaks');
    let btn_resume = $('#btn_resume');
    let btn_pause = $('#btn_pause');
    let btn_restart = $('#btn_restart');

    let update = function () {
        let hours = parseInt( time / 3600 );
        let minutes = parseInt( (time - (hours * 3600)) / 60 );
        let seconds = Math.floor((time - ((hours * 3600) + (minutes * 60))));

        element_minutes.text(minutes.toString().length < 2 ? '0' + minutes : minutes);
        element_seconds.text(seconds.toString().length < 2 ? '0' + seconds : seconds);

        if (status === 0) {
            element_status.text('Bekleniyor');
        }
        else if (status === 1) {
            element_status.text('Ekran');
        }
        else if (status === 2) {
            element_status.text('Mola');
        }

        if (minutes === 20 && seconds === 0) {
            skips++;
            ipcRenderer.send('alert');
        }
        else if (minutes >= 1 && seconds >= 0) {
            element_minutes.addClass('text-red-500');
            element_seconds.addClass('text-red-500');
            element_status.addClass('text-red-500');
        }
        else {
            element_minutes.removeClass('text-red-500');
            element_seconds.removeClass('text-red-500');
            element_status.removeClass('text-red-500');
        }

        element_breaks_count.text(breaks);
        element_skips.text(skips);

        if (skips === breaks) {
            element_health_status.text('Normal');
            element_health_status.removeClass('text-red-500');
        }
        else if (breaks > skips) {
            element_health_status.text('Sağlıklı');
            element_health_status.removeClass('text-red-500');
        }
        else if (skips > breaks) {
            element_health_status.text('SAĞLIKSIZ!');
            element_health_status.addClass('text-red-500');
        }
    };

    setInterval(function () {
        if (paused === false) {
            time++;
            update();
        }
    }, 1000);

    btn_resume.click(function () {
        if (paused !== false) {
            paused = false;
            status = 1;
            update();
        }
    });

    btn_pause.click(function () {
        if (paused !== true) {
            paused = true;
            time = 0;
            status = 2;
            breaks++;
            let date = new Date();
            element_breaks.append(`
                        <div class="flex p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                            <div class="w-1/2">${date.toLocaleDateString()}</div>
                            <div class="w-1/2">${date.getHours() + ':' + date.getMinutes()}</div>
                        </div>
                    `);
            update();
        }
    });

    btn_restart.click(function () {
        paused = true;
        time = 0;
        status = 0;
        breaks = 0;
        skips = 0;
        update();
    });
});
