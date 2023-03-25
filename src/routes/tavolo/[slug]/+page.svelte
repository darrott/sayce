<script>
  import { page } from '$app/stores';
  import './style.css';
  import user from '$lib/shared/stores/user';
  import piatti from '$lib/shared/stores/piatti';
  import { toast } from "@zerodevx/svelte-toast";

  $: piattiStore = $piatti

  const tableId = $page.params.slug;

  async function saveUser() {
    console.log('table', tableId);
    console.log('username', userName);
    const res = await fetch("http://localhost:3000/table/user/insert", {
      method: "POST",
      body: JSON.stringify({
        tableId: tableId,
        username: userName,
      })
    })

    const json = await res.json();
    if(json.state != "error" ){
      console.log('fatto')
    }
    else {
      console.log('errore')
    }
  }

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
    if(tempQuaPiatto == 0 || tempNumPiatto == ""){
      if(tempNumPiatto == "") toast.push("Numero piatto non puo' essere vuoto");
      if(tempQuaPiatto == 0) toast.push("Quantita piatto non puo' essere 0");
      return;
    } 
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
    updatePiattiStorage();
  }

  function updatePiattiStorage(){
    let tempPiatti = piatti;
    tempPiatti[tableId] = piattiLocal;
    piatti.set(tempPiatti);
  }

  function rimuoviPiatto(numeroPiatto){
    let piattiLocalNew = piattiLocal.filter(piatto => piatto.numero !== numeroPiatto);
    piattiLocal = piattiLocalNew;
    updatePiattiStorage(); 
  }

  function modificaPiatto(numeroPiatto, quantitaPiatto){
    setTempNumPiatto(numeroPiatto);
    setTempQuaPiatto(quantitaPiatto);
  }

  $: userName = $user;

  function salvaUtente(tempUsername){
    user.set(tempUsername);
    saveUser();
  }

  
</script>

{#if userName === 'user' || userName === ""}
  <h3>Come ti chiami?</h3>
  <input type='text' id='username' bind:value={tempUsername} placeholder="Il tuo nome" autocomplete="off"/>
  <button on:click={() => ( tempUsername != '' ? salvaUtente(tempUsername) : user.set(''))}>Salva</button>
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
        <span class="material-symbols-outlined" on:click={() => decrementaQuantita()}>remove</span>
        <span>{tempQuaPiatto}</span>
        <span class="material-symbols-outlined" on:click={() => incrementaQuantita()}>add</span>
      </div>
    </div>
    <button on:click={() => inserisciPiatto()}>Inserisci</button>
  </form>
  {#if piattiLocal.length > 0}
  <div class="totale-prenotazione-personale">
    <h4>Totale Piatti: {piattiLocal.length > 0 ? piattiLocal.length : ''}</h4>
    <ul>
    {#each piattiLocal as piatto}
      <li>
        N. {piatto.numero} - Quantita {piatto.quantita} 
        <span on:click={() => rimuoviPiatto(piatto.numero)} class="material-symbols-outlined">delete</span>
        <span on:click={() => modificaPiatto(piatto.numero, piatto.quantita)} class="material-symbols-outlined">edit</span>
      </li>
    {/each}
    </ul>
  </div>
  {/if}
{/if}


