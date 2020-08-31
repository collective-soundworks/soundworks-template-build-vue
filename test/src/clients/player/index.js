import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { Client } from '@soundworks/core/client';
import initQoS from '@soundworks/template-helpers/client/init-qos.js';
import servicePlatformFactory from '@soundworks/service-platform/client';
import serviceCheckinFactory from '@soundworks/service-checkin/client';

import PlayerExperience from './PlayerExperience.js';

const AudioContext = (window.AudioContext || window.webkitAudioContext)
const audioContext = new AudioContext();

const config = window.soundworksConfig;
// store experiences of emulated clients
const platformServices = new Set();

async function launch($container) {
  try {
    const client = new Client();

    // -------------------------------------------------------------------
    // register plugins
    // -------------------------------------------------------------------

    // client.pluginManager.register('platform', servicePlatformFactory, {
    //   features: [
    //     // @note - this syntax is ugly
    //     ['web-audio', audioContext],
    //     // ['devicemotion']
    //   ],
    // });

    client.registerService('platform', servicePlatformFactory, {
      features: [
        // @note - this syntax is ugly
        ['web-audio', audioContext],
        // ['devicemotion']
      ],
    });

    // client.registerService('checkin', serviceCheckinFactory);

    // -------------------------------------------------------------------
    // launch application
    // -------------------------------------------------------------------
    await client.init(config);
    initQoS(client);

    const experience = new PlayerExperience(client, config, $container);

    document.body.classList.remove('loading');

    // start all the things
    await client.start();
    experience.start();

    return Promise.resolve();
  } catch(err) {
    console.error(err);
  }
}

window.addEventListener('load', async () => {
  const $container = document.querySelector('#__soundworks-container');
  launch($container, 0)
})