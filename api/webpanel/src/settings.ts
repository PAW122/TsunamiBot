export function genSettings(parent: HTMLDivElement, title: string = "Settings", canDisable: boolean, text: String | null = null) {
    let main = document.createElement("div");
    main.classList.add("d-flex", "flex-column", "gap-2");
    let titleDiv = document.createElement("div");
    titleDiv.classList.add("h3");
    titleDiv.textContent = title;
    let inputGroup = document.createElement("div");
    inputGroup.classList.add("input-group");
    let select = document.createElement("select") as HTMLSelectElement;
    select.classList.add("form-select");
    let checkbox: HTMLInputElement | undefined = undefined;
    main.appendChild(titleDiv);
    main.appendChild(inputGroup);
    if (text) {
        text.length;
    }
    if (canDisable) {
        let inputGroupLeft = document.createElement("div");
        inputGroupLeft.classList.add("input-group-text");
        checkbox = document.createElement("input") as HTMLInputElement;
        checkbox.classList.add("form-check-input");
        checkbox.type = "checkbox";
        checkbox.addEventListener("change", function () {
            if (checkbox?.checked) {
                select.removeAttribute("disabled")
            } else {
                select.setAttribute("disabled", "true");
            }
        })
        inputGroup.appendChild(inputGroupLeft);
        inputGroupLeft.appendChild(checkbox);
    }
    inputGroup.appendChild(select)
    parent.appendChild(main);
    return {
        "checkbox": checkbox,
        "select": select
    }
}

export class setting {
    html = document.createElement("div");
    input_group;
    forms = [];
    name;
    constructor(name: string = "setting", description: string | undefined = undefined) {
        this.name = name;
        this.html.appendChild(
            Object.assign(document.createElement("div"), {
                class: "h3",
                textContent: name
            })
        )
        if (description) {
            this.html.appendChild(
                Object.assign(document.createElement("div"), {
                    textContent: description
                })
            );
        }
        this.input_group = Object.assign(document.createElement("div"), {
            class: "input-group"
        });
        this.html.appendChild(this.input_group);
    }
    addCheckbox(text: string | undefined = undefined) {
        let main = Object.assign(document.createElement("div"), {
            class: "input-group-text"
        });
        let checkbox = Object.assign(document.createElement("input"), {
            type: "radio",
            class: "form-check-input",
            name: this.name
        })
        main.appendChild(checkbox);
        if (text) {
            main.appendChild(
                Object.assign(
                    document.createElement("label"), {
                    class: "form-check-label",
                    textContent: text
                })
            );
        }
        this.input_group.append(main);
        return checkbox;
    }
    addSelect() {
        let main = Object.assign(document.createElement("select"), {
            class: "form-select"
        });
        this.input_group.append(main);
        return main;
    }
    append(parent: HTMLDivElement) {
        parent.appendChild(this.html);
    }
}