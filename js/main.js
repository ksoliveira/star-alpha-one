window.addEventListener('scroll', resizeHeaderOnScroll);

$(document).ready(function() {
	moveMenu();

	$(".book-option").on("click", function(){
		$(".book-option").removeClass("selected");
		let url_link = $(this).data("url");
		$(this).addClass("selected");
		$(".proceed a").attr("href", url_link);
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

    $("#goToTop").click(function(){
        $("html, body").animate({ scrollTop: 0 }, "slow");
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

    console.log('respWidth: ', respWidth);
}

$(window).on("load",function() {
    moveMenu();
});
$(window).on("resize",function() {
    moveMenu();
});
