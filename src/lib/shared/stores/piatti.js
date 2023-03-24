import { browser } from '$app/environment';
import { writable } from 'svelte/store';

const initialValue = browser ? window.localStorage.getItem('piatti') ?? '{}' : '{}';

const piatti = writable(JSON.parse(initialValue));

piatti.subscribe((value) => {
  if (browser) {
    window.localStorage.setItem('piatti', JSON.stringify(value));
  }
});

export default piatti;
