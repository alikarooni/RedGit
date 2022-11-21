class TableTemplate extends HTMLElement {
    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: 'open' })
            .innerHTML =`<style>
                            table {border-collapse: collapse; width: 100%;}
                                table tr:nth-child(even) { background-color: #f2f2f2; }
                                table tr:hover {background-color: #ccc;}
                                table td, th { border: 1px solid #ddd;padding: 8px;}
                                table th {padding-top: 12px;padding-bottom: 12px;text-align: left;
                                    background-color:#354e7e; color: white;}
                                .ten {width:10%}
                                .twenty {width:20%}
                        </style>
                        <table><tbody></tbody></table>`;
    }

    connectedCallback() {
        this.render();
        this.setSizes.bind(this)
        this.setTitles.bind(this)
        this.setDataSource.bind(this)
        this.clearContent.bind(this)
    }

    setSizes(sizes) {
        this.sizes = sizes;
        return this;
    }

    setTitles(titles) {
        this.titles = titles;
        let table = this.shadowRoot.querySelector('tbody')
        let tr = document.createElement('tr')

        for (var i = 0; i < titles.length; i++) {
            let th = document.createElement('th');
            th.style.width = this.sizes[i]
            th.appendChild(document.createTextNode(titles[i]));
            tr.appendChild(th);
        }

        table.appendChild(tr);

        return this;
    }

    setDataSource(dataSource) {
        let table = this.shadowRoot.querySelector('tbody')
        let sizes = this.sizes;
        let titles = this.titles;
        
        dataSource.forEach(function (row, i) {
            let tr = document.createElement('tr')

            titles.forEach(function (title, j) {
                let td = document.createElement('td');
                td.style.width = sizes[j]
                if (typeof row[title] === 'object')
                    td.appendChild(row[title])
                else
                    td.appendChild(document.createTextNode(row[title]));
                tr.appendChild(td);
            });
            table.appendChild(tr);
        });

        return this;
    }

    clearContent() {
        this.shadowRoot.innerHTML = `<style>
                            table {border-collapse: collapse; width: 100%;}
                                table tr:nth-child(even) { background-color: #f2f2f2; }
                                table tr:hover {background-color: #ccc;}
                                table td, th { border: 1px solid #ddd;padding: 8px;}
                                table th {padding-top: 12px;padding-bottom: 12px;text-align: left;
                                    background-color:#354e7e; color: white;}
                                .ten {width:10%}
                                .twenty {width:20%}
                        </style>
                        <table><tbody></tbody></table>`
    }

    render() {
        this.shadowRoot.innerHTML;
//            = `
//<style>
//    table {border-collapse: collapse; width: 100%;}
//        table tr:nth-child(even) { background-color: #f2f2f2; }
//        table tr:hover {background-color: #ddd;}
//        table td, th { border: 1px solid #ddd;padding: 8px;}
//        table th {padding-top: 12px;padding-bottom: 12px;text-align: left;
//            background-color: #888;color: white;}
//</style>
//<table><tbody></tbody></table>`
    }
}
window.customElements.define('table-template', TableTemplate);