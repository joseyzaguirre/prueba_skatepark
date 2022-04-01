$('.auth').on('click', async function() {

    isVal = $(this).is(':checked')
    userId = $(this).attr('data-id')
    
    await axios.put(`/users/${userId}`, {
        auth: isVal
    })
})