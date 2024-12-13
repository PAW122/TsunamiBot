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

export function genAddList(parent: HTMLDivElement, title: string = "AddList", initialItems: { trigger: string, response: string }[] = []) {
    let main = document.createElement("div");
    main.classList.add("d-flex", "flex-column", "gap-2");

    // Kontener dla tytułu i przycisku "+"
    let titleContainer = document.createElement("div");
    titleContainer.classList.add("d-flex", "align-items-center");

    // Tytuł
    let titleDiv = document.createElement("div");
    titleDiv.classList.add("h3");
    titleDiv.textContent = title;

    // Przycisk "+"
    let addButton = document.createElement("button");
    addButton.textContent = "+";
    addButton.classList.add("btn", "btn-primary", "ms-auto");
    addButton.addEventListener("click", () => {
        showModal();
    });

    // Dodajemy tytuł i przycisk do kontenera
    titleContainer.appendChild(titleDiv);
    titleContainer.appendChild(addButton);

    // Dodajemy kontener tytułu i przycisku do głównego kontenera
    main.appendChild(titleContainer);

    // Dodajemy elementy początkowe listy
    for (let item of initialItems) {
        addListElement(item.trigger, item.response);
    }

    // Dodajemy główny kontener do kontenera grupy wejściowej
    parent.appendChild(main);

    function showModal() {
        let modal = document.createElement("div");
        modal.classList.add("modal", "fade", "show", "d-block");
        modal.setAttribute("tabindex", "-1");
        modal.setAttribute("role", "dialog");

        let modalDialog = document.createElement("div");
        modalDialog.classList.add("modal-dialog");
        modalDialog.setAttribute("role", "document");

        let modalContent = document.createElement("div");
        modalContent.classList.add("modal-content");

        let modalHeader = document.createElement("div");
        modalHeader.classList.add("modal-header");

        let closeButton = document.createElement("button");
        closeButton.setAttribute("type", "button");
        closeButton.classList.add("btn-close");
        closeButton.setAttribute("data-bs-dismiss", "modal");
        closeButton.setAttribute("aria-label", "Close");
        modalHeader.appendChild(closeButton);

        let title = document.createElement("h5");
        title.classList.add("modal-title");
        title.textContent = "Add New Element";
        modalHeader.appendChild(title);

        let modalBody = document.createElement("div");
        modalBody.classList.add("modal-body");
        modalBody.innerHTML = `
            <form>
                <div class="mb-3">
                    <label for="trigger" class="form-label">Trigger:</label>
                    <input type="text" class="form-control" id="trigger">
                </div>
                <div class="mb-3">
                    <label for="response" class="form-label">Response:</label>
                    <input type="text" class="form-control" id="response">
                </div>
            </form>
        `;

        let modalFooter = document.createElement("div");
        modalFooter.classList.add("modal-footer");

        let saveButton = document.createElement("button");
        saveButton.textContent = "Save";
        saveButton.classList.add("btn", "btn-primary");
        saveButton.addEventListener("click", (event) => {
            event.preventDefault();
            let trigger = (modalBody.querySelector("#trigger") as HTMLInputElement).value;
            let response = (modalBody.querySelector("#response") as HTMLInputElement).value;
            addListElement(trigger, response);
            modal.remove();
        });

        let closeButtonFooter = document.createElement("button");
        closeButtonFooter.textContent = "Close";
        closeButtonFooter.classList.add("btn", "btn-secondary");
        closeButtonFooter.setAttribute("data-bs-dismiss", "modal");

        modalFooter.appendChild(closeButtonFooter);
        modalFooter.appendChild(saveButton);

        modalContent.appendChild(modalHeader);
        modalContent.appendChild(modalBody);
        modalContent.appendChild(modalFooter);

        modalDialog.appendChild(modalContent);
        modal.appendChild(modalDialog);

        document.body.appendChild(modal);
    }

    function addListElement(trigger: string, response: string) {
        let listElement = document.createElement("div");
        listElement.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");
        listElement.innerHTML = `
            <div>
                <strong>Trigger:</strong> ${trigger}<br>
                <strong>Response:</strong> ${response}
            </div>
            <div>
                <button class="btn btn-primary btn-sm me-1">Edit</button>
                <button class="btn btn-danger btn-sm">Delete</button>
            </div>
        `;
        parent.insertBefore(listElement, main);
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

/**
 * 
 * @param parent 
 * @param value 
 * @param buttonId 
 * @param buttonClass 
 * @param url 
 * @returns 
 */
export function genButtonElement(parent: HTMLElement, value: string, buttonId: string, buttonClass: string, url: string): HTMLButtonElement {
    // Tworzenie głównego kontenera dla przycisku
    const container = document.createElement("div");
    container.classList.add("container", "mt-4");

    // Tworzenie wiersza i komórki dla przycisku
    const row = document.createElement("div");
    row.classList.add("row", "justify-content-center");
    const col = document.createElement("div");
    col.classList.add("col-md-6");

    // Tworzenie karty i zawartości karty
    const card = document.createElement("div");
    card.classList.add("card");
    const cardBody = document.createElement("div");
    cardBody.classList.add("card-body");

    // Tworzenie przycisku
    const button = document.createElement("button");
    button.id = buttonId;
    button.classList.add("btn", buttonClass);
    button.textContent = value;

    // Dodanie obsługi zdarzenia kliknięcia przycisku
    button.addEventListener("click", () => {
        window.location.href = url;
    });

    // Dodanie przycisku do zawartości karty
    cardBody.appendChild(button);
    card.appendChild(cardBody);
    col.appendChild(card);
    row.appendChild(col);
    container.appendChild(row);
    parent.appendChild(container);

    // Zwracanie przycisku
    return button;
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