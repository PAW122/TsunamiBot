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

export function genCheckBox(parent: HTMLDivElement, title: string = "TextBox", checked: boolean, ) {
    let main = document.createElement("div");
    main.classList.add("d-flex", "flex-column", "gap-2");
    
    // Kontener dla tytułu i checkboxa
    let titleContainer = document.createElement("div");
    titleContainer.classList.add("d-flex", "align-items-center");

    // Tytuł
    let titleDiv = document.createElement("div");
    titleDiv.classList.add("h3");
    titleDiv.textContent = title;

    // Checkbox
    let checkbox = document.createElement("input") as HTMLInputElement;
    checkbox.classList.add("form-check-input");
    checkbox.type = "checkbox";

    // Dopasowanie wysokości checkboxa do wysokości tekstu
    checkbox.style.height = getComputedStyle(titleDiv).fontSize || "16px";

    // Ustawienie początkowego stanu zaznaczenia checkboxa
    checkbox.checked = checked;

    // Dodajemy tytuł i checkbox do kontenera
    titleContainer.appendChild(titleDiv);
    titleContainer.appendChild(checkbox);

    // Dodajemy kontener tytułu i checkboxa do głównego kontenera
    main.appendChild(titleContainer);

    // Dodajemy główny kontener do kontenera grupy wejściowej
    parent.appendChild(main);

    return {
        "checkbox": checkbox,
        // Zwracamy checkbox, aby można było go użyć później
    };
}


export function addTooltip(titleDiv: HTMLElement, description: string) {
    titleDiv.title = description;
}

// Funkcja generująca pole tekstowe z przyciskiem "Save"
export function genTextBox(parent: HTMLDivElement, title: string = "TextBox", text: string | null = null, saveCallback: (data: string) => void) {
    let main = document.createElement("div");
    main.classList.add("d-flex", "flex-column", "gap-2");
    let titleDiv = document.createElement("div");
    titleDiv.classList.add("h3");
    titleDiv.textContent = title;
    let inputGroup = document.createElement("div");
    inputGroup.classList.add("input-group");

    // Tworzenie pola tekstowego
    let input = document.createElement("input") as HTMLInputElement;
    input.type = "text";
    input.classList.add("form-control");
    if (text) {
        input.value = text;
    }

    // Tworzenie przycisku "Save"
    let saveButton = document.createElement("button");
    saveButton.textContent = "Save";
    saveButton.classList.add("btn", "btn-primary");
    saveButton.addEventListener("click", function () {
        // Wywołanie funkcji zwrotnej z danymi z pola tekstowego
        saveCallback(input.value);
    });

    main.appendChild(titleDiv);
    main.appendChild(inputGroup);

    // Dodawanie pola tekstowego i przycisku do grupy wejściowej
    inputGroup.appendChild(input);
    inputGroup.appendChild(saveButton);

    // Dodawanie grupy wejściowej do głównego kontenera
    parent.appendChild(main);

    return {
        "input": input,
        "saveButton": saveButton
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