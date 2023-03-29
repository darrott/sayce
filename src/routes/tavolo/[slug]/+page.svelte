<script>
  import { page } from '$app/stores';
  import { browser } from "$app/environment";
  import './style.css';
  import user from '$lib/shared/stores/user';
  import piatti from '$lib/shared/stores/piatti';
  import { toast } from "@zerodevx/svelte-toast";
  import { getContext } from 'svelte';
  import Popup from '../../../components/popup/popup.svelte'
  const { open } = getContext('simple-modal');
  const showPopup = () => open(Popup, { totaleOrdinazioneTavolo: totaleOrdinazioneTavolo })
  import io from "socket.io-client"

  console.log(process.env);
  if(browser){
    const socket = io(`http://localhost:3001/`, {
      query: { roomId: $page.params.slug }
    });
    socket.on('nuovo-partecipante', (data) => {
      whoIsAtTable().then((value) => chiSedutoAlTavolo = value);
    })
  }

  

  $: userName = $user.username;
  $: userUUID = $user.uuid;
  $: piattiStore = $piatti

  let tableId;

  if (browser) {
    tableId = $page.params.slug;
    console.log('Username', userName);
    if (userName != "" && userName != undefined){
      saveUser();
    }
  }


  async function saveUser() {
    const res = await fetch(`http://localhost:3001/table/user/insert`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "tableId": tableId,
        "username": $user,
      })
    })

    const json = await res.json();
    if(json.state != "error" ){
      console.log('fatto')
      let tempUserData = $user;
      tempUserData.uuid = json.data.userUUID;
      user.set(tempUserData);
    }
    else {
      console.log('errore')
    }
  }

  async function saveOrdinazione(){
    const res = await fetch(`http://localhost:3001/table/user/updateCart`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ "piatti": $piatti[tableId], "tableId": tableId, "userUUID": $user.uuid}),
    });

    const json = await res.json();
    console.log(json);
  }

  let chiSedutoAlTavolo;
  if(browser){
    whoIsAtTable().then((value) => chiSedutoAlTavolo = value);
  }

  async function whoIsAtTable(){
    const res = await fetch(`http://localhost:3001/table/seated`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tableId: tableId }),
    });

    const json = await res.json();
    console.log(json.data);
    return json.data;
  }

  let totaleOrdinazioneTavolo;

  async function getTotalTavolo(){
    const res = await fetch(`http://localhost:3001/table/getTotal`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ "tableId": tableId }),
    });

    const json = await res.json();
    let array = [];
    let totaleOrdinazione;
    json.data.forEach((ordinazione) => {
      array.push(ordinazione.ordinazione)
    })
    array = array.toString().replaceAll('[', '').replaceAll(']','');
    array = ['['+array+']'];
    totaleOrdinazione = raggruppaPerNumero(JSON.parse(array));
    totaleOrdinazioneTavolo = totaleOrdinazione;
    showPopup();
  }

  function raggruppaPerNumero(arr) {
    return Object.values(arr.reduce((acc, cur) => {
      if (!acc[cur.numero]) {
        acc[cur.numero] = { numero: cur.numero, quantita: 0 };
      }
      acc[cur.numero].quantita += cur.quantita;
      return acc;
    }, {}));
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
    saveOrdinazione();
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


  function salvaUtente(tempUsername){
    let tempUserData = $user;
    tempUserData.username = tempUsername;
    user.set(tempUserData);
    saveUser();
  }

  function shareTable(){
    if(navigator.share){
      navigator.share({
        title: 'Sayce, mangiare in compagnia',
        text: 'Inizia a scegliere i tuoi piatti!',
        url: $page.path,
      })
      .then(() => console.log('Shared!'))
      .catch((error) => console.log('Error: ', error))
    }
    else {
      navigator.clipboard.writeText($page.path);
      toast.push('Link copiato!');
    }
  }
  
</script>

{#if userName === 'user' || userName === ""}
  <h3>Come ti chiami?</h3>
  <input type='text' id='username' bind:value={tempUsername} placeholder="Il tuo nome" autocomplete="off"/>
  <button on:click={() => ( tempUsername != '' ? salvaUtente(tempUsername) : user.set(''))}>Salva</button>
{:else}
  <h3>Ciao {userName}</h3>
  <button on:click={() => shareTable()}>Condividi</button>
  {#if chiSedutoAlTavolo != null}
    <h4>Seduti al tavolo:</h4>
      <div style="display: flex; flex-direction: row; justify-content: space-evenly; gap: 10px; flex-wrap: wrap;">
      {#each chiSedutoAlTavolo as item } 
        <div style="display: flex; flex-direction: column; justify-content: center; align-items: center;">
          <span class="material-symbols-outlined">account_circle</span>
          <span>{item.username}</span>
        </div>
      {/each}
    </div>
  {/if}
  <h3>Cosa vuoi ordinare?</h3>
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
  <br />
  <button on:click={() => getTotalTavolo()}>Totali</button>
{/if}


