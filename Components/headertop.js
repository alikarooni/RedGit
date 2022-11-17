const template = document.createElement('template');
template.innerHTML = `
<style>
  header {
    margin: 10px;
    padding: 20px 10px 10px 10px;
    position: relative;
    display: block;
    text-shadow: 1px 1px 1px rgba(0,0,0,0.2);
    text-align: center;
}

    header h1 {
        font-size: 30px;
        line-height: 38px;
        margin: 0;
        position: relative;
        font-weight: 300;
        color: #666;
        text-shadow: 0 1px 1px rgba(255,255,255,0.6);
    }
</style>

    <header>
        <b><h1>Red-Git</h1></b>
    </header>   
`;

class headertop extends HTMLElement {
    constructor() {
        super();        
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }

    connectedCallback() {
        this.render();
    }

    render() {
    }
}
window.customElements.define('header-top', headertop);
