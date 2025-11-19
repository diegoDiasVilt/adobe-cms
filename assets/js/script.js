$('[data-toggle="popover"]').click(function(e) {
      e.preventDefault();
});

// Acessibilidade
$(function() {
   $('[data-toggle="popover"]').popover({
         trigger: 'focus',
         html: true
      });

   $('a, p, h1, h2, h3, h4, h5, h6, img, figcaption, button, footer, span, ul, ol, li, code, dl, dt, pre, blockquote, dd, th, tbody, thead, tfoot, col, table').each(function(index) {
         $(this).attr('tabindex', ++index);
      });
});


$(function () {
  $('[data-toggle="tooltip"]').tooltip()
});


$("button").removeClass('dropdown-toggle');

/* Alterar texto */
$(document).ready(function() {

    $('#btnFonte').click(function (event) {
        event.preventDefault(); 

        $('body').toggleClass('novaFonte');

        if($('body').hasClass('novaFonte')){
            localStorage.setItem('novaFonte', 'novaFonte');
        }
        else{
            localStorage.removeItem('novaFonte');
        }
    });
});

var savedmini = localStorage.getItem('novaFonte');  
if(savedmini !== ''){      
    document.getElementsByTagName('body')[0].classList.add(savedmini);
} else {
    document.getElementsByTagName('body')[0].classList.remove(savedmini);
}

/* Print */
function handleOutboundLinkClicks(event) {
   gtag('event', 'Download PDF', {
      event_category: 'Não pode faltar', // Alterar pelo nome da aula
      event_label: 'PDF KLS'
   });
}

function imprimir(event) {
    window.print();
};