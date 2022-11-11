class Textbox extends HTMLElement {
    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();

        this.shadow.querySelector('label').innerText = this.getAttribute('label');
        this.shadow.querySelector('input').setAttribute('placeholder', this.getAttribute('placeholder'));
        let textbox = this.shadow.querySelector('input');
        textbox.addEventListener('change', this.onChange.bind(this));
        textbox.addEventListener('input', this.onInput.bind(this));
        this.shadow.dataSources = this.getAttribute('dataSources') !== null ?
            this.getAttribute('dataSources').split(",") : [];

        this.importDataSource.bind(this)
        this.createUlList(this.shadow.dataSources)
    }
    importDataSource(list) {
        if (this.shadow.dataSources === undefined || this.shadow.dataSources.length === 0) {
            this.shadow.dataSources = list
        }
        else {
            list.forEach(x => this.shadow.dataSources.push(x))
        }
    }
    createUlList(list) {
        let ul = this.shadow.querySelector('ul')
        ul.innerHTML = ''
        for (var i = 0; i < list.length; i++) {
            let li = document.createElement('li')
            li.appendChild(document.createTextNode(list[i].name.trim()))
            li.addEventListener('click', this.liClick.bind(this), true)
            li.setAttribute('value', list[i].name.trim());
            li.setAttribute('key', list[i].id);
            ul.appendChild(li)
        }

        ul.setAttribute('hidden', 'hidden')
    }

    liClick(e) {
        this.shadow.querySelector('input').value = e.currentTarget.getAttribute('value');
        this.shadow.querySelector('input').setAttribute('key', e.currentTarget.getAttribute('key'));
        this.setAttribute('key', e.currentTarget.getAttribute('key'))
        this.setAttribute('text', e.currentTarget.getAttribute('value'))
        this.shadow.querySelector(".listbox").setAttribute('hidden', 'hidden')
    }
    onInput(e) {
        this.createUlList(this.shadow.dataSources.filter(x => x.name.toLowerCase().includes(e.target.value.toLowerCase())).slice(0, 15))
        this.shadow.querySelector(".listbox").removeAttribute('hidden')
    }
    async onChange(e) {
        let str = e.target.value
        this.setAttribute('text', str);
        await new Promise(r => setTimeout(r, 300));
        if (str.length == 0 || this.shadow.dataSources.filter(x => x == str).length == 1)
            this.shadow.querySelector(".listbox").setAttribute('hidden', 'hidden')
    }

    onFocusOut(e) {
        console.log('lost focus')
        this.shadow.querySelector(".listbox").setAttribute('hidden', 'hidden')
    }

    render() {
        this.shadow.innerHTML = `
<style>
    .form-control {margin: 10px 0;}
    .form-control label {display: inline-block; width: 38%;clear: both; text-align: right;
        vertical-align: middle; line-height: 30px; margin-right: 2%;}
    .textbox {height: 40px; margin: 0px; padding: 2px 5px; font-size: 14px;width:95%;
        border-width:1px;border-radius:.1rem;}
    .listbox{ border: 1px solid black;font-size: 14px; margin: 0px; position: absolute;
            width:55%; background-color:white;padding:3px 7px;z-index:20;}
    .input{ width:60%; float: right;}
    .input li{ list-style: none; padding:3px 0; }
    .input li:hover{ background-color:gray;}
</style>
<div class="form-control">
    <label id="lbl"></label>
    <div class="input">
        <input id="txt" class="textbox" type="text" />
        <ul class="listbox">
        </ul>
    </div>   
</div>`
    }
}
window.customElements.define('text-box', Textbox);