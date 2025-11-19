$("#resultado").hide();
$("#happy").hide();

var url_acesso = location.href; //pega endereço que esta no navegador

$('#botao03').click(function(){    
    $('#botao04').attr('disabled', true);
});

$('#botao04').click(function(){
    $('#botao03').attr('disabled', true);    
});

$('input[name=layout]').change(function(){
    $(this).closest("form").submit();
    console.log('entrou');
});


var xhr = new XMLHttpRequest();
xhr.open("GET", "cabecalho.txt", true);
xhr.send();
xhr.responseType = "text";

var texto = '';

xhr.onload = function(){
  texto = (this.response);
  var linhas = texto.split(/\n/);
    
    var tipo_produto_res = linhas[0];
    var semestre_res = linhas[1];
    var disciplina_res = linhas[2];
    var unidade_res = linhas[3];
    var secao_res = linhas[4];
    var prioridade_res = linhas[5];
    var software_res = linhas[6];
    var midias_res = linhas[7];

    console.log(tipo_produto_res);
    console.log(disciplina_res);
    console.log(semestre_res);
    console.log(unidade_res);
    console.log(secao_res);
    console.log(prioridade_res);
    console.log(software_res);
    console.log(midias_res); 
    
    document.getElementById('software_resposta').value = software_res;
    document.getElementById('tipo_produto_resposta').value = tipo_produto_res;
    document.getElementById('disciplina_resposta').value = disciplina_res;
    document.getElementById('semestre_resposta').value = semestre_res;
    document.getElementById('unidade_resposta').value = unidade_res;
    document.getElementById('secao_resposta').value = secao_res;
    document.getElementById('prioridade_resposta').value = prioridade_res;
    document.getElementById('midias_resposta').value = midias_res;
   
}

document.getElementById('url_acesso').value = url_acesso;

	jQuery(document).ready(function(){       
		jQuery('#formulario').submit(function(){
			var dados = jQuery(this).serialize();             
			jQuery.ajax({
				type: "POST",
				url: "https://dedmd.com.br/formulario_diagramador/dados_aprimoramento.php",
				data: dados,
				success: function( data )
				{
                    $('#resultado02').hide();
					$("#resultado").fadeIn(1000);
                    
                    $('#form-oculto').hide();
                    $("#happy").fadeIn(1000);
                    
                    form-oculto
				}
              //dataType: "jsonp"
			});
			
			return false;
		});
	});