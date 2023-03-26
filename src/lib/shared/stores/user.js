import { browser } from '$app/environment';
import { writable } from 'svelte/store';

const defaultValue = '{"username": "", "uuid": ""}';
const initialValue = browser
  ? JSON.parse(window.localStorage.getItem('userdata') ?? defaultValue)
  : defaultValue;

const username = writable(initialValue);

username.subscribe((value) => {
  if (browser) {
    window.localStorage.setItem('userdata', JSON.stringify(value));
  }
});

export default username;
