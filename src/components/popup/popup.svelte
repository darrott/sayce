<script>
  export let totaleOrdinazioneTavolo;
  console.log('totale',totaleOrdinazioneTavolo)
</script>
<h2>Totale Ordinazioni Tavolo</h2>
{#if totaleOrdinazioneTavolo.length > 0}
  <ul>
  {#each totaleOrdinazioneTavolo as ordinazione}
    <li>Num. Piatto {ordinazione.numero} - Quantita: {ordinazione.quantita}</li>
  {/each}
  </ul>
{:else if totaleOrdinazioneTavolo.length == 0}
  <p>Non ci sono ancora ordinazioni 😕</p>
{/if}
