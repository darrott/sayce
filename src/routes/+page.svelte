<script>
  async function generaTavolo(){
    const res = await fetch(`http://localhost/table/create`, {
      method: "POST",
    });

    const json = await res.json();
    if(json){
      window.location.href = "/tavolo/" + json.uuid;
    }
  }
  import './style.css'
</script>

<h2>Benvenuto su Sayce</h2>

<button on:click={() => generaTavolo()}>Crea Tavolo</button>
