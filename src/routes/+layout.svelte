<script>
  import Header from '../components/header/header.svelte'
  import Toolbar from '../components/toolbar/toolbar.svelte'

  import './layout.css'
</script>

<main>
  <Header />
    <div class="app">
      <slot />
    </div>
  <Toolbar />
</main>



