function terms_change(checkbox){
    //If it is checked.

    let values = checkbox.value.split(',');//first value is id of the item, second value is the name of the list
    const idItem = values[0]; //this is id of the item
    const listTitle = values[1]; //this value is the title of the list

    if(checkbox.checked){

        console.log('Checkbox has been ticked!');
        update(idItem, "checked", listTitle);
        
    }
    //If it has been unchecked.
    else{
        console.log('Checkbox has been unticked!');
        update(idItem, "", listTitle);
    }
}; //end terms_change

function update(id, state, listTitle){

	fetch("http://localhost:3000/update" , {
                method:'post',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  id: id,
                  state: state,
                  listTitle: listTitle
                })//end body
              }).then(res => res.json())
				.catch(error => console.error('Error:', error))
				.then(response => console.log('Success:', response));

}