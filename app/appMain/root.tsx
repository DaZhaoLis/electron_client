import React from 'react';
import { Provider } from 'mobx-react';
import { hot } from 'react-hot-loader/root';
import { Router, Redirect } from 'react-router-dom';
import { renderRoutes } from 'react-router-config';
import { createBrowserHistory, createHashHistory } from 'history';
import { syncHistoryWithStore } from 'mobx-react-router';
import { IntlProvider } from 'react-intl';
import Config from 'app/config';
import allRoutes from './routes/route_config';

const History = Config.isBorwserHistory
  ? createBrowserHistory({
      basename: window.location.pathname,
    })
  : createHashHistory();

type Props = {
  store: any;
  statusCode: number;
  messages: any;
};

const Root = ({ store, statusCode, messages }: Props) => {
  return (
    <IntlProvider
      locale={navigator.language}
      defaultLocale={navigator.language}
      messages={messages}
    >
      <Provider {...store}>
        <Router history={syncHistoryWithStore(History, store.routerStore)}>
          {/* <Routes /> */}
          {renderRoutes(allRoutes)}
          {window.location.hash === '#/' ? <Redirect to="index" /> : null}
        </Router>
      </Provider>
    </IntlProvider>
  );
};

export default hot(Root);
