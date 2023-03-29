<script>
  async function generaTavolo(){
    const res = await fetch(`http://${process.env.PUBLIC_WEBSITE_ADDRESS}/table/create`, {
      method: "POST",
    });

    const json = await res.json();
    console.log(json)
    if(json){
      window.location.href = "/tavolo/" + json.uuid;
    }
  }
</script>

<h2>Benvenuto su Sayce</h2>

<button on:click={() => generaTavolo()}>Crea Tavolo</button>
