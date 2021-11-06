var apiPath = '';
var apiHomologacao  = 'https://api.homologation.staralphaone.space';
var apiProd         = 'https://api.staralphaone.space';

var urlPath = window.location.href;

if (urlPath.indexOf('localhost/') > -1 || urlPath.indexOf('127.0.0.1/') > -1) {
    apiPath = apiHomologacao;
} else {
    apiPath = apiProd;
}

var register = {};
var isACustomer = false;
var hasPayment = false;

var palladiumAmount = 1;
var palladiumPrice;
var uploadRequired = true;
var paymentRequired = true;
var billingAddressRequired = false;

var planQuantity = 1;
var subscriptionPlan;

var bookInvoicesEndpoint = '/book_invoices';
var subscriptionPlansEndpoint = '/subscription_plans?page=1';
var cadetsEndpoint = '/cadets';

var countryDDI = '+1';
var invalidPhoneNumberMessageError = 'Invalid phone number.';
var defaultFieldMessageError = 'This field can not be left blank.';

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
        planQuantity = palladiumAmount;
    });

    $('.amount-minus').on('click', function(){
        palladiumAmount = palladiumAmount - 1;
        let totalPrice = palladiumAmount * palladiumPrice;
        if(palladiumAmount >= 1){
            register.setPalladiumValues(totalPrice, palladiumAmount);
        } else {
            palladiumAmount = 1;
        }
        planQuantity = palladiumAmount;
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
    register.getSubscriptionPlans()
        .then(function(plans) {
            if(plans) {
                register.setPlanPrices(plans);
            }
        });
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

    $(document).on("change", "#date_of_birth", register.checkRequiredFields);

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

    $(document).on('keyup'  , '#phone_number', register.formatPhoneNumber);
    $(document).on('keydown', '#phone_number', register.formatPhoneNumber);
    $(document).on('blur'   , '#phone_number', register.validateFormatPhoneNumber);
    $(document).on('change' , '#phone_number', register.validateFormatPhoneNumber);

    $(document).on('keyup'  , '#cerdit_card_cvv_code', register.formatOnlyNumber);
    $(document).on('keydown', '#cerdit_card_cvv_code', register.formatOnlyNumber);
    $(document).on('change', '#cerdit_card_cvv_code', register.formatOnlyNumber);

    $(document).on('keyup'  , '#credit_card_number', register.formatOnlyNumber);
    $(document).on('keydown', '#credit_card_number', register.formatOnlyNumber);
    $(document).on('change', '#credit_card_number', register.formatOnlyNumber);

    $(document).on('keyup'  , '#cerdit_card_expiration_date', register.formatExpirationDate);
    $(document).on('keydown', '#cerdit_card_expiration_date', register.formatExpirationDate);
    $(document).on('change', '#cerdit_card_expiration_date', register.formatExpirationDate);

    $(document).on('change', '#address_country', register.changeCountry)

    $('#date_of_birth').datepicker();
};

register.setPalladiumValues = function(totalPrice, amount) {
    $('.palladiumprice span').text(totalPrice).digits();
    // $('.palladiumprice').parent().attr('data-price', totalPrice);
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
    planQuantity = 1;
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
    } else {
        register.scrollToTheFirstFieldError();
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
    } else {
        if(fieldId != "phone-number") {
            register.unsetFieldError(this);
        }
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

    subscriptionPlan = $(this).data('id');
    
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
            price = $('.plan-holder[data-plan="bronze"]').data('price');
            $('.plan-amount-container span').text(price).digits();
            subscriptionPlan = $('.plan-holder[data-plan="bronze"]').data('id');
            if(isACustomer) {
                price = 0;
                register.showAmountAndDiscout();
                subscriptionPlan = $('.plan-holder[data-plan="bronze"]').data('free');
            } 
        break;

        case 'silver':
            price = $('.plan-holder[data-plan="silver"]').data('price');
            $('.plan-amount-container span').text(price).digits();
            if(isACustomer) {
                price = parseFloat(price - 99);
                register.showAmountAndDiscout();
            } 
        break;

        case 'gold':
            price = $('.plan-holder[data-plan="gold"]').data('price');
            $('.plan-amount-container span').text(price).digits();
            if(isACustomer) {
                price = price - 99;
                register.showAmountAndDiscout();
            } 
        break;

        case 'platinum':
            price = $('.plan-holder[data-plan="platinum"]').data('price');
            $('.plan-amount-container span').text(price).digits();
            if(isACustomer) {
                price = price - 99;
                register.showAmountAndDiscout();
            } 
        break;

        case 'diamond':
            price = $('.plan-holder[data-plan="diamond"]').data('price');
            $('.plan-amount-container span').text(price).digits();
            if(isACustomer) {
                price = price - 99;
                register.showAmountAndDiscout();
            } 
            
        break;

        case 'palladium':
            price = $('.plan-holder[data-plan="palladium"]').data('price');
            price = price * palladiumAmount;
            $('.plan-amount-container span').text(price).digits();
            register.hideAmountAndDiscout();
        break;
    }

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
            $('#password + small').text(defaultFieldMessageError);
            $('#password-retry + small').text(defaultFieldMessageError);
            register.unsetFieldError($('#password'));
            register.unsetFieldError($('#password-retry'));
        }
    } else {
        $('#password + small').text(defaultFieldMessageError);
        $('#password-retry + small').text(defaultFieldMessageError);
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
    var address_complement = "";
    var ddi = "";

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

    // About Plan
    var subscription_plan = subscriptionPlan;
    var plan_quantity = planQuantity;
    
    var form_headers = new Headers();
    form_headers.append("Content-Type", "application/json");

    endpoint = `{
            "callSign": "${call_sign}",
            "firstName": "${first_name}",
            "lastName": "${last_name}",
            "dateOfBirth": "${date_of_birth}",
            "user": {
                "email": "${email}",
                "password": "${password}"
            },
            "addresses": [
                {
                    "street": "${address_street}",
                    "complement": "${address_complement}",
                    "city": "${address_city}",
                    "state": "${address_state}",
                    "country": "${address_country}",
                    "postalCode": "${address_zipcode}"
                }
            ],
            "contacts": [
                {
                    "ddi": "${ddi}",
                    "phone": "${phone_number}"
                }
            ],
            "cadetSubscriptionPlans": [
                {
                    "quantity": ${plan_quantity},
                    "subscriptionPlan": "${subscription_plan}"
                }
            ],
            "creditCardHolderName": "${credit_card_holdername}",
            "creditCardNumber": "${credit_card_number}",
            "creditCardCode": "${cerdit_card_cvv_code}",
            "creditCardExpirationDate": "${cerdit_card_expiration_date}"
        }`;

    register.loading();
    return fetch(apiPath + cadetsEndpoint,{ 
        method: 'POST',
        headers: form_headers,
        body: endpoint
    })
    .then(function(response){

        return response.json();
    })
    .then(function(response){
        if(response.violations) {
            register.setPostFieldsError(response.violations);
            register.loading_out();
            return response.violations;
        }
        return response;
    })
    .catch(function(err){
        console.log(err);
        register.loading_out();
    })
}

register.setPostFieldsError = function (violations) {
    violations.forEach(violation => {
        var field = violation.propertyPath;
        var message = violation.message;
        var element = $('.form-group input[data-name="' + field + '"]');
        if(!element || $(element).length == 0) {
            element = $('.form-group select[data-name="' + field + '"]');
        }

        if(!element || $(element).length == 0) {
            return;
        } else {
            $(element).parents('.form-group').first().find('small').text(message);
            $(element).parents('.form-group').first().addClass('error');
        }
    });
    register.scrollToTheFirstFieldError();
}

register.scrollToTheFirstFieldError = function() {
    $('html, body').animate({
        scrollTop: ($('.form-group.error').first().offset().top - 300)
    }, 600);
}

register.getSubscriptionPlans = function() {
    return fetch(apiPath + subscriptionPlansEndpoint, {
        method: "GET",
        mode: "cors",
        credentials: "same-origin",
        })
        .then((response) => {
            return response.json();
        })
        .then((res) => {
            if(res && res['hydra:member']) {
                var plans = res['hydra:member'];
                return plans;
            }
            return false;
        })
        .catch(function (err) {
            console.log(err);
    });
}

register.setPlanPrices = function(plans) {
    plans.forEach(plan => {
        var planName = plan.name;
        var planPrice = parseFloat(plan.value);
        var isActive = plan.isActive;
        var planId = plan['@id'];
        var planElement = $('.plan-holder[data-plan="'+ planName +'"]');
        var planPriceElement = $('.plan-holder[data-plan="'+ planName +'"] .plan-price');

        if(planName == 'palladium') {
            palladiumPrice = planPrice
        }

        if(planName == 'bronze free' && isActive == true) {
            $('.plan-holder[data-plan="bronze"]').attr('data-free', planId);
        }

        if(planElement && isActive == true) {
            $(planElement).attr('data-price', planPrice);
            $(planElement).attr('data-id', planId);
            $(planPriceElement).text('$' + planPrice).digits();
        }
    });

    var bronzeText = $('.plan-holder[data-plan="bronze"]').text();
    $('.final_price').text(bronzeText.trim().substring(0, bronzeText.length))
    $('.plan-upgrade').removeClass('hidden');
    register.setValue('bronze');
};

register.postBookInvoices = function() {

    var bookInvoice = document.getElementById('bookInvoice');;
    var form_data = new FormData();
    var form_headers = new Headers();

    form_headers.append("Content-Type", "multipart/form-data");

    form_data.append("file", bookInvoice.files[0]);
    form_data.append("cadetSubscriptionPlan", subscriptionPlan);

    return fetch(apiPath + bookInvoicesEndpoint,{ 
            method: 'POST',
            mode: 'cors',
            credentials: "same-origin",
            headers: form_headers,
            body: form_data
        })
        .then(function(response){
    
            // if(response.ok)
            //     {
            //         return response.text();
            //     } else{
            //         msg = new message();
            //         msg.duration(5);
            //         msg.add('<i class="icon ban red"></i> Ocorreu um erro durante o carregamento desta página');
            //     }
    
            return response.json();
        })
        .catch(function(err){
            console.log(err);
        })
    
}

register.formatPhoneNumber = function() {
    var phone = $(this).val();

    if(phone.indexOf(countryDDI) < 0) {
        phone = countryDDI + phone;
    }

    phone = libphonenumber.formatIncompletePhoneNumber(phone);

    $(this).val(phone);
}

register.validateFormatPhoneNumber = function() {
    var phone = $(this).val();
    var isValid = libphonenumber.isPossiblePhoneNumber(phone);

    if(!isValid) {
        $('#phone_number + small').text(invalidPhoneNumberMessageError);
        $('#phone_number').parents('.form-group').first().addClass('error');
    }
}

register.changeCountry = function() {
    $('#phone_number').val('');
    $('#phone_number').parents(".form-group").first().removeClass("error");

    var ddi = $(this).find(':selected').data('ddi');
    if(ddi != 'xxx') {
        countryDDI = '+' + ddi;
    } else {
        countryDDI = '+'
    }
}

register.formatOnlyNumber = function() {
    $(this).val(this.value.match(/[0-9]*/));
}

register.loading = function() {
    $('.data-loading').removeClass('hidden');
    $('html, body').css('overflow', 'hidden');
}

register.loading_out = function() {
    $('.data-loading').addClass('hidden');
    $('html, body').css('overflow', 'scroll');
}


register.formatExpirationDate = function() {
    var value = $(this).val();
    var formatted = value.replace(/^(\d{4})(\d{2}).*/, '$1-$2');

    $(this).val(formatted);
}

// ✅ 3 dígitos no campo cvv
// ✅ deixar só números no campo credit card number
// ✅ Adicionar o loading ao submeter o formulário.
// ✅ Campo de telefone formatado conforme o país escolhido.
// ✅ Scroll para o primeiro campo com erro após o POST do form.
// ✅ Inferir o DDI de acordo com o país que o cara escolher

// ✅ Máscara no campo expiration-date
// ❌ Adicionar componente de calendário (datepicker) no campo de date of birth
// ❌ Retirar (se necessário) os campos de billing-address
// ❌ Feedback visual de que o cadet foi cadastraco com sucesso.
// ❌ Mostrar mensagem de mínimo de 16 dígitos no campo credit card number
// ❌ Mostrar mensagem de exatamente 3 dígitos no campo cvv
// ❌ Submeter a imagem de upload
// ❌ Carregar Estados/cidades dos EUA e Canadá
//    ❌ Tornar o campo estado como texto quando nao for Estados unidos nem canadá

