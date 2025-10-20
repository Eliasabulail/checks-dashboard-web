// src/index.js (or index.web.js)
import { AppRegistry } from 'react-native';
import App from './App'; // Your root React Native component
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
