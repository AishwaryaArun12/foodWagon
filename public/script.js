var modal = document.getElementById("myModal");
// Get the image and insert it inside the modal - use its "alt" text as a caption
var imgs = document.getElementsByClassName("myImg");
var modalImg = document.getElementById("img01");
var captionText = document.getElementById("caption");

for (let i=0;i<imgs.length;i++) {
  imgs[i].onclick = function(){
  modal.style.display = "block";
  modalImg.src = this.src;
  captionText.innerHTML = this.alt;
}
}

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

function crtMenu(){
    const btn = document.getElementById('crtMenu');
    btn.style.display = 'none';
    let menu = null;
    fetch('../restuarents/addMenu',{method: 'post'}).then(res=>res.json()).then((data)=>{
        menu = data;
        console.log(data,'menu created..');})
        .catch(error=>{console.error(error)});
        if (menu){
            let tableContainer = document.getElementById('tableContainer');
            const table = document.createElement('table');
        table.classList.add('table'); // Add Bootstrap class for styling (optional)

        // Create rows and cells
        const numRows = 5; // Number of rows
        const numCols = 3; // Number of columns

        for (let i = 0; i < numRows; i++) {
            const row = table.insertRow();

            for (let j = 0; j < numCols; j++) {
                const cell = row.insertCell();
                cell.textContent = `Row ${i + 1}, Column ${j + 1}`;
            }
        }

        // Append the table to the container
        tableContainer.appendChild(table);

        }
    
}
function addFoodType(){
    const category = document.getElementById('category');
    const newFoodType = document.getElementById('newFoodType');
    const value = newFoodType.value;
            const categoryInput = document.createElement('option');
            categoryInput.innerText = value;
            inputFoodType.appendChild(categoryInput);
}
let toggleMenu = false;
const menu = document.getElementById('menu');
const search = document.getElementById('search');


function toggle(){
    if(!toggleMenu){
        toggleMenu = true;
        search.style.display = "none";
        menu.style.display = "block"
    }else{
        toggleMenu = false;
        menu.style.display = "none";
    }
}
