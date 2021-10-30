var register = {};
var isACustomer = false;
var hasPayment = false;

var palladiumAmount = 1;
var palladiumPrice = 10000;

$(document).ready(function() {
    $('.amount-plus').on('click', function(){
        palladiumAmount = palladiumAmount + 1;
        let totalPrice = palladiumAmount * palladiumPrice;
        if(palladiumAmount <= 100){
            register.setPalladiumValues(totalPrice, palladiumAmount);
        } else {
            palladiumAmount = 100;
        }
    });

    $('.amount-minus').on('click', function(){
        palladiumAmount = palladiumAmount - 1;
        let totalPrice = palladiumAmount * palladiumPrice;
        if(palladiumAmount >= 1){
            register.setPalladiumValues(totalPrice, palladiumAmount);
        } else {
            palladiumAmount = 1;
        }
    });

    $("button.hamburger--collapse").click(function(){
        $(this).toggleClass("is-active");
	});

    // $('.submitbtn').on('click', function(){
    //     registrationSubmit();
    // });

    register.start();
});

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
}

$.fn.digits = function(){ 
    return this.each(function(){ 
        $(this).text( $(this).text().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") ); 
    })
}

register.start = function() {
    register.configEvents();
    register.getHash();
}

register.configEvents = function () {
    $(document).on("click", "#rgisterBtn", register.check);

    $(document).on("blur", ".register-required", register.checkRequiredFields);

    $(document).on('click', '.btnBrowseTicket', function() {
        $('#bookInvoice').trigger('click');
    });

    $(document).on("focus", ".register-required", register.unsetSpecificLoginFieldError);

    $(document).on('change', '#bookInvoice', function() {
        var fieldValue = $(this).val();
        if (!fieldValue) {
            register.setFieldError($('.file-ticket'));
        } else {
            $(".file-ticket").parent().removeClass("error");
        }
    });

    $(document).on('click', '.add-billing-adress--choose', register.toggleBillingAddress)
};

register.setPalladiumValues = function(totalPrice, amount) {
    $('.palladiumprice span').text(totalPrice).digits();
    $('.palladiumprice').parent().attr('data-price', totalPrice);
    $(".final_plan").text('palladium');
    $(".final_price").text(totalPrice).digits();
    $('.palladium-amount').text(amount);
    $('.plan-upgrade .plan .plan-holder[data-plan="palladium"]').trigger('click');
}

register.toggleBillingAddress = function() {
    $(this).toggleClass('active');
    var isActive = $(this).hasClass('active');

    if(isActive) {
        $('.add-billing-adress--container').removeClass('hidden');
    } else {
        $('.add-billing-adress--container').addClass('hidden');
    }
}

register.unsetSpecificLoginFieldError = function () {
    $(this).parents(".form-group").first().removeClass("error");
};

register.check = function (event) {
    event.preventDefault();
    //register.unsetAllFieldsError();
    //register.unsetLoginFieldError();
    register.blurRequiredFields();

    if (!register.hasFieldWithError) {
        console.log('Submeter formulário.');
    }
};

register.checkRequiredFields = function () {
    var fieldValue = $(this).val();
    var fieldId = $(this).attr("id");

    if (!fieldValue) {
        register.setFieldError(this);

        if (fieldId == "bookInvoice") {
            register.setFieldError($('.file-ticket'));
        }
        //register.setLoginFieldError();
    } else if (fieldId == "login-email") {
        var validEmail = isValidEmail(fieldValue);

        if (!fieldValue || !validEmail) {
            register.setFieldError(this);
            //register.setLoginFieldError();
        } else {
            $("#login-email").parents(".form-group").first().addClass("success");
        }
    }
};

register.blurRequiredFields = function () {
    $(".register-required").trigger("blur");
};

register.unsetAllFieldsError = function () {
    $(".form-group").removeClass("error");
};

register.unsetLoginFieldError = function () {
    register.hasFieldWithError = false;
};

register.setFieldError = function (field) {
    $(field).parents(".form-group").first().removeClass("success");
    $(field).parents(".form-group").first().addClass("error");
};

register.getHash = function() {
    if(window.location.hash) {
        var hash = window.location.hash.substring(1);
        if(hash == 'wantToBuy') {
            isACustomer = false;
        } else if(hash == 'haveTheBook') {
            isACustomer = true;
        } 
    } else {
        window.location.hash = 'wantToBuy';
    }

    register.setPage();
}

register.setPage = function() {
    if(!isACustomer) {
        $('.have-the-book').hide();
        register.removeUploadField();

    } else {
        $('.want-to-buy').hide();
        register.upgradePlan();
    }

    register.showOrHidePayment();
    $('.plan-select').removeClass('hidden');
    $(".plan .plan-holder").click(register.changePlan);
}

register.removeUploadField = function () {
    $('.upload-container').remove();
}

register.upgradePlan = function () {
    $('.current-plan.current-plan-only-bronze').removeClass('hidden');
}

register.changePlan = function() {
    $(".plan .plan-holder").removeClass("selected");
    $(this).addClass("selected");

    if(isACustomer){
        let img = $(this).children("img").attr("src");   
        let plan_name = $(this).data("plan");
        let plan_price = $(this).data("price");

        if(plan_name == 'bronze') {
            $('.current-plan.current-plan-only-bronze').removeClass('hidden');
            $('.current-plan.current-plan-current-upgrade').addClass('hidden');
            hasPayment = false;
        } else {
            $('.current-plan.current-plan-only-bronze').addClass('hidden');
            $('.current-plan.current-plan-current-upgrade').removeClass('hidden');
            hasPayment = true;
        }

        register.showOrHidePayment();

        $(".upgraded-plan img").attr("src", img);
        $(".final_plan").text(plan_name);
        $(".final_price").text(plan_price);

        $('#quantity').attr('value', '1');
        $('#subplan').attr('value', plan_name);
        $('#subprice').attr('value', plan_price);
    }
}

register.showOrHidePayment = function() {
    if(!isACustomer || (isACustomer && hasPayment)) { 
        $('.payment-container').removeClass('hidden');
    } else {
        $('.payment-container').addClass('hidden');
    }
}