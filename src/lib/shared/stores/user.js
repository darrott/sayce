import { browser } from '$app/environment';
import { writable } from 'svelte/store';

const defaultValue = 'user';
const initialValue = browser
  ? window.localStorage.getItem('username') ?? defaultValue
  : defaultValue;

const username = writable(initialValue);

username.subscribe((value) => {
  if (browser) {
    window.localStorage.setItem('username', value);
  }
});

export default username;
