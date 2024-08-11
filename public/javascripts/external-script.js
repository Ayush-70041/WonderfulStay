document.addEventListener('DOMContentLoaded', function() {
  // Attach event listeners to date and guest inputs
  document.querySelectorAll('.date-inputs input, .guests-inputs input').forEach(function(input) {
      input.addEventListener('change', function() {
          const itemId = this.id.split('_')[1]; // Extract item ID from input ID
          const subtotalElem = document.querySelector(`#subtotal_${itemId}`);
          
          // Fetch price and quantity from data attributes
          const price = parseFloat(subtotalElem.dataset.price);
          const quantity = parseFloat(subtotalElem.dataset.quantity);

          if (!isNaN(price) && !isNaN(quantity)) {
              calculateSubtotal(itemId, price, quantity);
          }
      });
  });

  document.getElementById('proceedToPay').addEventListener('click', function(e) {
      e.preventDefault();
      // Handle payment modal logic or redirect here
  });
});

function calculateSubtotal(itemId, price, quantity) {
  const checkInDate = new Date(document.getElementById(`checkIn_${itemId}`).value);
  const checkOutDate = new Date(document.getElementById(`checkOut_${itemId}`).value);

  if (checkInDate && checkOutDate && checkOutDate > checkInDate) {
      const days = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
      const subtotal = price * days * quantity;
      document.getElementById(`subtotal_${itemId}`).textContent = `Subtotal: $${subtotal.toFixed(2)}`;
      
      // Update the total price if needed
      updateTotalPrice();
  }
}

function updateTotalPrice() {
  let total = 0;
  document.querySelectorAll('.subtotal').forEach(function(subtotalElem) {
      const subtotalText = subtotalElem.textContent.replace('Subtotal: $', '');
      const subtotal = parseFloat(subtotalText);
      if (!isNaN(subtotal)) {
          total += subtotal;
      }
  });
  document.querySelector('.total-price').textContent = `Total Price: $${total.toFixed(2)}`;
}
