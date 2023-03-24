<script>
  import { page } from '$app/stores';
  import './style.css';
  import user from '$lib/shared/stores/user';
  import piatti from '$lib/shared/stores/piatti';

  $: piattiStore = $piatti

  const tableId = $page.params.slug;

  let tempUsername = "";
  let tempNumPiatto = "";
  let tempQuaPiatto = 0;
  let piattiLocal = $piatti[tableId]  ? $piatti[tableId] : [];

  function setTempNumPiatto(numeroPiatto){
    return tempNumPiatto = numeroPiatto;
  }

  function setTempQuaPiatto(quantitaPiatto){
    return tempQuaPiatto = quantitaPiatto;
  }

  function incrementaQuantita(){
    let quantitaPiatto = tempQuaPiatto;
    quantitaPiatto++;
    setTempQuaPiatto(quantitaPiatto);
  }
  function decrementaQuantita(){
    let quantitaPiatto = tempQuaPiatto;
    quantitaPiatto--;
    if(quantitaPiatto < 0) quantitaPiatto = 0
    setTempQuaPiatto(quantitaPiatto);
  }

  function inserisciPiatto(){
    if(tempQuaPiatto == 0 && tempNumPiatto != "") return;
    let found = false;
    piattiLocal.map((value) => {
      if(value.numero === tempNumPiatto){
        value.quantita = tempQuaPiatto;
        piattiLocal = piattiLocal;
        found = true;
      }
    })
    if(found == false){
      let prenotazione = { "numero": tempNumPiatto, "quantita": tempQuaPiatto };
      piattiLocal = [ ...piattiLocal, prenotazione ];
    }
    setTempQuaPiatto(0);
    setTempNumPiatto("");
    console.log(piattiLocal);
    let tempPiatti = piatti;
    tempPiatti[tableId] = piattiLocal;
    piatti.set(tempPiatti);
  }

  function rimuoviPiatto(numeroPiatto){
    let piattiLocalNew = piattiLocal.filter(piatto => piatto.numero !== numeroPiatto);
    piattiLocal = piattiLocalNew;
  }

  function modificaPiatto(numeroPiatto, quantitaPiatto){
    setTempNumPiatto(numeroPiatto);
    setTempQuaPiatto(quantitaPiatto);
  }

  $: userName = $user;



  
</script>

{#if userName === 'user' || userName === ""}
  <h3>Come ti chiami?</h3>
  <input type='text' id='username' bind:value={tempUsername} placeholder="Il tuo nome" autocomplete="off"/>
  <button on:click={() => ( tempUsername != '' ? user.set(tempUsername) : user.set(''))}>Salva</button>
{:else}
  <h3>Ciao {userName}</h3>
  <h4>Cosa vuoi ordinare?</h4>
  <form>
    <div class="label-input">
      <label for="numero-piatto">Numero Piatto</label>
      <input type="text" placeholder="Numero piatto" bind:value={tempNumPiatto}/>
    </div>
    <div class="label-buttons">
      <label for="quantita-piatto">Quantita Piatto</label>
      <div>
        <button on:click={() => decrementaQuantita()}>-</button>
        <span>{tempQuaPiatto}</span>
        <button on:click={() => incrementaQuantita()}>+</button>
      </div>
    </div>
    <button on:click={() => inserisciPiatto()}>Inserisci</button>
  </form>
  {#if piattiLocal.length > 0}
  <div class="totale-prenotazione-personale">
    <h4>Piatti:</h4>
    <ul>
    {#each piattiLocal as piatto}
      <li>
        N. {piatto.numero} - Quantita {piatto.quantita} 
        <button on:click={() => rimuoviPiatto(piatto.numero)}>Del</button>
        <button on:click={() => modificaPiatto(piatto.numero, piatto.quantita)}>Mod</button>
      </li>
    {/each}
    </ul>
  </div>
  {/if}
{/if}


