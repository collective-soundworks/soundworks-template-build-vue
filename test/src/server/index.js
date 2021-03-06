import 'source-map-support/register';
import { Server } from '@soundworks/core/server';
import servicePlatformFactory from '@soundworks/service-platform/server';
import serviceCheckinFactory from '@soundworks/service-checkin/server';
import path from 'path';
import serveStatic from 'serve-static';
import compile from 'template-literal';

import PlayerExperience from './PlayerExperience.js';

import getConfig from './utils/getConfig.js';
const ENV = process.env.ENV || 'default';
const config = getConfig(ENV);
const server = new Server();

// html template and static files (in most case, this should not be modified)
// server.templateEngine = { compile };
// server.templateDirectory = path.join('.build', 'server', 'tmpl');
// server.router.use(serveStatic('public'));
// server.router.use('build', serveStatic(path.join('.build', 'public')));
// server.router.use('vendors', serveStatic(path.join('.vendors', 'public')));

console.log(`
--------------------------------------------------------
- launching "${config.app.name}" in "${ENV}" environment
- [pid: ${process.pid}]
--------------------------------------------------------
`);

// -------------------------------------------------------------------
// register plugins
// -------------------------------------------------------------------
// server.pluginManager.register(pluginName, pluginFactory, [pluginOptions], [dependencies])
// server.pluginManager.register('platform', servicePlatformFactory);
// server.pluginManager.register('checkin', serviceCheckinFactory);
server.registerService('platform', servicePlatformFactory);
server.registerService('checkin', serviceCheckinFactory);

// -------------------------------------------------------------------
// register schemas
// -------------------------------------------------------------------
// server.stateManager.registerSchema(name, schema);


(async function launch() {
  try {
    // @todo - check how this behaves with a node client...
    await server.init(config, (clientType, config, httpRequest) => {
      return {
        clientType: clientType,
        app: {
          name: config.app.name,
          author: config.app.author,
        },
        env: {
          type: config.env.type,
          websockets: config.env.websockets,
          assetsDomain: config.env.assetsDomain,
        }
      };
    });

    const playerExperience = new PlayerExperience(server, 'player');

    // html template and static files (in most case, this should not be modified)
    server.configureHtmlTemplates({ compile }, path.join('.build', 'server', 'tmpl'))
    server.router.use(serveStatic('public'));
    server.router.use('build', serveStatic(path.join('.build', 'public')));
    server.router.use('vendors', serveStatic(path.join('.vendors', 'public')));

    // start all the things
    await server.start();
    playerExperience.start();

  } catch (err) {
    console.error(err.stack);
  }
})();

process.on('unhandledRejection', (reason, p) => {
  console.log('> Unhandled Promise Rejection');
  console.log(reason);
});