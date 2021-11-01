var register = {};
var isACustomer = false;
var hasPayment = false;

var palladiumAmount = 1;
var palladiumPrice = 10000;
var uploadRequired = true;
var paymentRequired = true;
var billingAddressRequired = false;

var fieldsIds = 
    ['call_sign',
    'first_name',
    'last_name',
    'address_street',
    'address_country',
    'address_state',
    'address_city',
    'address_zipcode',
    'date_of_birth',
    'phone_number',
    'email',
    'password'
    ];

var paymentFieldsIds = 
    ['credit_card_holdername',
    'credit_card_number',
    'cerdit_card_expiration_date',
    'cerdit_card_cvv_code'
    ];

var billingAddressFieldsIds = 
    ['billing_address_street',
    'billing_address_country',
    'billing_address_state',
    'billing_address_city',
    'billing_address_zipcode'
    ];

register.hasFieldWithError = false;
register.hasPaymentFieldWithError = false;
register.hasBillingAddressFieldWithError = false;


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
    $(document).on('click', '.btnBrowseTicket', function() {
        $('#bookInvoice').trigger('click');
    });
    $(document).on('click', '.add-billing-adress--choose', register.toggleBillingAddress);

    $(document).on("blur", ".register-required", register.checkRequiredFields);
    $(document).on("blur", ".payment-required", register.checkPaymentRequiredFields);
    $(document).on("blur", ".billing-address-required", register.billingAddressRequiredFields);

    $(document).on("focus", ".register-required", register.unsetSpecificFieldError);
    $(document).on("focus", ".payment-required", register.unsetSpecificFieldError);
    $(document).on("focus", ".billing-address-required", register.unsetSpecificFieldError);

    $(document).on('change', '#bookInvoice', function() {
        var fieldValue = $(this).val();
        if (!fieldValue) {
            register.setFieldError($('.file-ticket'));
        } else {
            $(".file-ticket").parent().removeClass("error");
        }
    });
};

register.setPalladiumValues = function(totalPrice, amount) {
    $('.palladiumprice span').text(totalPrice).digits();
    $('.palladiumprice').parent().attr('data-price', totalPrice);
    $(".final_plan").text('palladium');
    $('.palladium-amount').text(amount);
    $('.plan-upgrade .plan .plan-holder[data-plan="palladium"]').trigger('click');
    register.setValue('palladium');
}

register.resetPalladium = function () {
    var totalPrice = 10000;
    var amount = 1
    $('.palladiumprice span').text(totalPrice).digits();
    $('.palladiumprice').parent().attr('data-price', totalPrice);
    $('.palladium-amount').text(amount);
    palladiumAmount = 1;
}

register.toggleBillingAddress = function() {
    $(this).toggleClass('active');
    var isActive = $(this).hasClass('active');

    if(isActive) {
        $('.add-billing-adress--container').removeClass('hidden');
        billingAddressRequired = true;
    } else {
        $('.add-billing-adress--container').addClass('hidden');
        billingAddressRequired = false;
    }
}

register.unsetSpecificFieldError = function () {
    $(this).parents(".form-group").first().removeClass("error");
};

register.check = function (event) {
    event.preventDefault();
    register.unsetAllFieldsError();
    
    // Register Fields
    register.unsetRegisterFieldError();
    register.blurRequiredFields();

    // Payment Fields
    register.unsetRegisterPaymentFieldError();
    register.blurRequiredPaymentFields();

    // Billing Address Fields
    register.unsetRegisterBillingAddressFieldError();
    register.blurRequiredBillingAddressFields();

    if (!register.hasFieldWithError &&
        !register.hasPaymentFieldWithError &&
        !register.hasBillingAddressFieldWithError) {

        register.sendForm();
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
        register.setRegisterFieldError();
    } else if (fieldId == "email") {
        var validEmail = register.isValidEmail(fieldValue);

        if (!fieldValue || !validEmail) {
            register.setFieldError(this);
            register.setRegisterFieldError();
        }
    } else if (fieldId == "password" || fieldId == "password-retry") {
        register.verifyPassword();
    }
};

register.checkPaymentRequiredFields = function() {
    var fieldValue = $(this).val();
    
    if (!fieldValue && paymentRequired) {
        register.setFieldError(this);
        register.setRegisterPaymentFieldError();
    }
}

register.billingAddressRequiredFields = function() {
    var fieldValue = $(this).val();
    
    if (!fieldValue && billingAddressRequired) {
        register.setFieldError(this);
        register.setRegisterBillingAddressFieldError();
    }
}

register.blurRequiredFields = function () {
    $(".register-required").trigger("blur");
};

register.blurRequiredPaymentFields = function () {
    $(".payment-required").trigger("blur");
};

register.blurRequiredBillingAddressFields = function () {
    $(".billing-address-required").trigger("blur");
};

register.unsetAllFieldsError = function () {
    $(".form-group").removeClass("error");
};

register.unsetRegisterFieldError = function () {
    register.hasFieldWithError = false;
};

register.setRegisterFieldError = function () {
    register.hasFieldWithError = true;
};

register.unsetRegisterPaymentFieldError = function () {
    register.hasPaymentFieldWithError = false;
};

register.setRegisterPaymentFieldError = function () {
    register.hasPaymentFieldWithError = true;
};

register.unsetRegisterBillingAddressFieldError = function () {
    register.hasBillingAddressFieldWithError = false;
};

register.setRegisterBillingAddressFieldError = function () {
    register.hasBillingAddressFieldWithError = true;
};

register.setFieldError = function (field) {
    $(field).parents(".form-group").first().removeClass("success");
    $(field).parents(".form-group").first().addClass("error");
};

register.unsetFieldError = function (field) {
    $(field).parents(".form-group").first().removeClass("success");
    $(field).parents(".form-group").first().removeClass("error");
};

register.getHash = function() {
    if(window.location.hash) {
        var hash = window.location.hash.substring(1);
        if(hash == 'wantToBuy') {
            isACustomer = false;
            uploadRequired = false;
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
        register.hideAmountAndDiscout();
    } else {
        $('.want-to-buy').hide();
        register.upgradePlan();
    }

    register.setValue('bronze');
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
    
    let plan_name = $(this).data("plan");
    
    $(".final_plan").text(plan_name);
    
    register.setValue(plan_name);

    if(plan_name != 'palladium') register.resetPalladium();

    uploadRequired = true;

    if(isACustomer){
        let img = $(this).children("img").attr("src");   
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

        if(plan_name == 'palladium') {
            $('.upload-container').addClass('hidden');
            uploadRequired = false;
        } else {
            $('.upload-container').removeClass('hidden');
            uploadRequired = true;
        }

        register.showOrHidePayment();

        $(".upgraded-plan img").attr("src", img);
        
    }
}

register.showOrHidePayment = function() {
    if(!isACustomer || (isACustomer && hasPayment)) { 
        $('.payment-container').removeClass('hidden');
        paymentRequired = true;
    } else {
        $('.payment-container').addClass('hidden');
        paymentRequired = false;
    }
}

register.setValue = function(planName) {
    var price = 0;
    
    switch(planName) {
        case 'bronze':
            price = 99;
            $('.plan-amount-container span').text(price).digits();
            if(isACustomer) {
                price = 0;
                register.showAmountAndDiscout();
            } 
        break;

        case 'silver':
            price = 250;
            $('.plan-amount-container span').text(price).digits();
            if(isACustomer) {
                price = price - 99;
                register.showAmountAndDiscout();
            } 
        break;

        case 'gold':
            price = 500;
            $('.plan-amount-container span').text(price).digits();
            if(isACustomer) {
                price = price - 99;
                register.showAmountAndDiscout();
            } 
        break;

        case 'platinum':
            price = 1000;
            $('.plan-amount-container span').text(price).digits();
            if(isACustomer) {
                price = price - 99;
                register.showAmountAndDiscout();
            } 
        break;

        case 'diamond':
            price = 5000;
            $('.plan-amount-container span').text(price).digits();
            if(isACustomer) {
                price = price - 99;
                register.showAmountAndDiscout();
            } 
            
        break;

        case 'palladium':
            price = 10000;
            price = price * palladiumAmount;
            $('.plan-amount-container span').text(price).digits();
            register.hideAmountAndDiscout();
        break;
    }

    $('#quantity').attr('value', '1');
    $('#subplan').attr('value', planName);
    $('#subprice').attr('value', price);
    $('.final_price').text(price).digits();
    

}

register.hideAmountAndDiscout = function () {
    $('.plan-discount-container').addClass('hidden');
    $('.plan-amount-container').addClass('hidden');
}

register.showAmountAndDiscout = function () {
    $('.plan-discount-container').removeClass('hidden');
    $('.plan-amount-container').removeClass('hidden');
}

register.isValidEmail = function(email) {
    const reg = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return reg.test(String(email).toLowerCase());
}

register.verifyPassword = function() {
    var password = $('#password').val();
    var passwordRetry = $('#password-retry').val();

    if(password && passwordRetry) {
        if(password != passwordRetry) {
            register.setFieldError($('#password'));
            register.setFieldError($('#password-retry'));
            register.setRegisterFieldError();
            $('#password + small').text('Passwords must match.');
            $('#password-retry + small').text('Passwords must match.');
        } else {
            $('#password + small').text('This field can not be left blank.');
            $('#password-retry + small').text('This field can not be left blank.');
            register.unsetFieldError($('#password'));
            register.unsetFieldError($('#password-retry'));
        }
    } else {
        $('#password + small').text('This field can not be left blank.');
        $('#password-retry + small').text('This field can not be left blank.');
    }
}

register.sendForm = function() {
    // fields
    var call_sign = $('#call_sign').val();
    var first_name = $('#first_name').val();
    var last_name = $('#last_name').val();
    var address_street = $('#address_street').val();
    var address_country = $('#address_country').val();
    var address_state = $('#address_state').val();
    var address_city = $('#address_city').val();
    var address_zipcode = $('#address_zipcode').val();
    var date_of_birth = $('#date_of_birth').val();
    var phone_number = $('#phone_number').val();
    var email = $('#email').val();
    var password = $('#password').val();

    // paymentFields
    var credit_card_holdername = $('#credit_card_holdername').val();
    var credit_card_number = $('#credit_card_number').val();
    var cerdit_card_expiration_date = $('#cerdit_card_expiration_date').val();
    var cerdit_card_cvv_code = $('#cerdit_card_cvv_code').val();

    // billingPaymentFields
    var billing_address_street = $('#billing_address_street').val();
    var billing_address_country = $('#billing_address_country').val();
    var billing_address_state = $('#billing_address_state').val();
    var billing_address_city = $('#billing_address_city').val();
    var billing_address_zipcode = $('#billing_address_zipcode').val();

    // uploadField
    var uploadField = $('#bookInvoice').val();

    // About Plan
    var planName = $('#subplan').val();
    var planQuantity = $('#quantity').val();
    var planPrice = $('#subprice').val();
    

    var payload = `{
        "firstName": ${first_name},
        "lastName": "string",
        "dateOfBirth": "1980-01-31",
        "user": {
        "email": "user@example.com",
        "password": "string"
        },
        "addresses": [
        {
            "street": "string",
            "complement": "string",
            "city": "string",
            "state": "string",
            "country": "string",
            "postalCode": "12345"
        }
        ],
        "contacts": [
        {
            "ddi": "+123",
            "phone": "1234-5678"
        }
        ],
        "cadetSubscriptionPlans": [
        {
            "quantity": 1,
            "subscriptionPlan": "/subscription_plans/1",
            "bookInvoice": {
            "name": "string"
            }
        }
        ],
        "creditCardHolderName": "stringstringstri",
        "creditCardNumber": "4111111111111111",
        "creditCardCode": "123",
        "creditCardExpirationDate": "2038-12"
    }`;
    
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


/*

fieldsIds.forEach(item => {
    $('#' + item).val('aaa@aaa.aaa');
});

paymentFieldsIds.forEach(item => {
    $('#' + item).val('aaa');
});

billingAddressFieldsIds.forEach(item => {
    $('#' + item).val('aaa');
});

*/


