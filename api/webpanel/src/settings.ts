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