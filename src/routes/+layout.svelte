<script>
  import Header from '../components/header/header.svelte'
  import Toolbar from '../components/toolbar/toolbar.svelte'
  import { SvelteToast } from '@zerodevx/svelte-toast'

  const options = {};

  import './layout.css'
</script>
<!-- Icone -->
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />

<SvelteToast {options} />
<main>
  <Header />
    <div class="app">
      <slot />
    </div>
  <Toolbar />
</main>



