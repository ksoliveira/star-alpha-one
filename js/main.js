$(document).ready(function() {

    let pal = [10000, 20000, 30000, 1000000]; 
    let pos = 0;


    $('.amount-plus').on('click', function(){
        pos = pos + 1;
        if(pos <= 4){
            $('.palladiumprice span').text(pal[pos]).digits();
            $('.palladiumprice').parent().attr('data-price', pal[pos]);
            $(".final_plan").text('palladium');
            $(".final_price").text(pal[pos]);
        } else {
            pos = 4;
        }
    });

    $('.amount-minus').on('click', function(){
        pos = pos - 1;
        if(pos >= 0){
            $('.palladiumprice span').text(pal[pos]).digits();
            $('.palladiumprice').parent().attr('data-price', pal[pos]);
            $(".final_plan").text('palladium');
            $(".final_price").text(pal[pos]);
        } else {
            pos = 0;
        }
    });





    $("button.hamburger--collapse").click(function(){
	    $(this).toggleClass("is-active");
	});

	moveMenu();



	$(".book-option").on("click", function(){
		$(".book-option").removeClass("selected");
		let url_link = $(this).data("url");
		$(this).addClass("selected");
		$(".proceed a").attr("href", url_link);

	});


	$(".plan-upgrade .plan .plan-holder").on("click", function(){
		$(".plan-upgrade .plan .plan-holder").removeClass("selected");
		$(this).addClass("selected");

	});

	$(".head-right ul").clone().appendTo("#mobile-menu .mobile-menu-inner");


	$(".mobile-menu").on("click", function(){
		$(".head-right ul").toggleClass("menu-open");
	});

    $(".faq-scroll").click(function() {
        $('html, body').animate({
            scrollTop: ($(".faq").offset().top - 300)
        }, 1000);
    });


    $(".plan .plan-holder").click(function() {
        let img = $(this).children("img").attr("src");   
        let plan_name = $(this).data("plan");
        let plan_price = $(this).data("price");


        $(".upgraded-plan img").attr("src", img);
        $(".final_plan").text(plan_name);
        $(".final_price").text(plan_price);

        $('#quantity').attr('value', '1');
        $('#subplan').attr('value', plan_name);
        $('#subprice').attr('value', plan_price);

    });


    $("#myBtn").click(function(){
        $("html, body").animate({ scrollTop: 0 }, "slow");
    });


    $('.submitbtn').on('click', function(){
        registrationSubmit();
    });


});


function resizeHeaderOnScroll() {
    const distanceY = window.pageYOffset || document.documentElement.scrollTop,
        shrinkOn = 0,
        headerEl = document.getElementById('sticky-header');
    let sliderMargin = $('.static-margin');
    if (distanceY > shrinkOn) {
        headerEl.classList.add("smaller");
        sliderMargin.addClass("active-static-margin");
    } else {
        headerEl.classList.remove("smaller");
        sliderMargin.removeClass("active-static-margin");
    }
}
window.addEventListener('scroll', resizeHeaderOnScroll);

	
function moveMenu() {
    let respWidth = window.innerWidth;
    let ua = navigator.userAgent.toLowerCase();
    if (ua.indexOf("safari/") !== -1 && ua.indexOf("chrom") === -1) {
        respWidth = $(window).width();
    }
    if (respWidth < 991) {
        $('.head-left').insertBefore('.header .container');
    } else {
        $('.head-left').insertBefore('.head-center');
    }

    console.log(respWidth);
}



$(window).on("load",function() {
    moveMenu();
});
$(window).on("resize",function() {
    moveMenu();
});




$.fn.digits = function(){ 
    return this.each(function(){ 
        $(this).text( $(this).text().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") ); 
    })
}






///////////
///////////
///////////
function registrationSubmit() {

    let first_name = $('#first_name').val();
    let last_name = $('#last_name').val();

    let dob = $('#dob').val();


    let address_street = $('#address_street').val();
    let address_city = $('#address_city').val();
    let address_state = $('#address_state').val();
    let address_country = $('#address_country').val();
    let address_zip = $('#address_zipcode').val();



    let phone_number = $('#phone_number').val();
    let email = $('#email').val();
    let pw1 = $('#pw1').val();
    let pw2 = $('#pw2').val();


    let subplan = $('#subplan').val();
    let quantity = $('#quantity').val();
    let subprice = $('#subprice').val();
    let bookInvoice = $('#bookInvoice').val();



    $.ajax({
        url: "#",
        beforeSend: function(xhr) { 
          xhr.setRequestHeader("Authorization", "Basic #"); 
        },
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: `{"firstName":"${first_name}", "lastName":"${last_name}", "dateOfBirth":"${dob}", "email":"${email}", "password":"${pw1}", "street":"${address_street}", "complement":"${address_street}", "city":"${pw1}", "state":"${pw1}", "country":"${pw1}", "postalCode":"${pw1}", "phone":"${phone_number}", "quantity":"${quantity}", "subscriptionPlan":"${subplan}", "bookInvoice":"${bookInvoice}"}`,
        success: function (data) {
          alert('Submitted');
        },
        error: function(){
          alert("Cannot get data");
        }
    });

}  //registrationSubmit ends






