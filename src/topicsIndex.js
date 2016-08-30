import { setAppName } from './config.js';
import { setAppColors } from './styles/colors.js';
import routes from './routes/topicRoutes';
import store from './store';
import initializeApp from './index.js';
import { filterBySnapshot, filterByTimespan, filterByFocus } from './actions/topicActions';

setAppName('topics');

setAppColors({
  light: '#daf3ee',
  dark: '#47c4ac',
});

// check if url has any params we care about
const hash = window.location.hash;
const hashParts = hash.split('?');
const args = {};
const queryParts = hashParts[1].split('&');
queryParts.forEach((part) => {
  const argParts = part.split('=');
  args[argParts[0]] = argParts[1];
});
if ('snapshotId' in args) {
  store.dispatch(filterBySnapshot(args.snapshotId));
}
if ('timespanId' in args) {
  store.dispatch(filterByTimespan(args.timespanId));
}
if ('focusId' in args) {
  store.dispatch(filterByFocus(args.focusId));
}

initializeApp(routes);