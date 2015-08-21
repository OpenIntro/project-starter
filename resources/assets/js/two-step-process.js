var formBrain = {
    init: function(settings){
        formBrain.config = {
            leadAPI: "https://forms.submitsecurity.com/webservice/assistedlivinghelp-lead.php",
            //leadAPI: "http://localhost/IMS/forms.submitsecurity.com/public_html/webservice/assistedlivinghelp-lead.php",
            citiesAPI: "https://forms.submitsecurity.com/webservice/cities.php",
            zipcodeAPI: "https://forms.submitsecurity.com/webservice/zipcode.php",
            zipLookupAPI: "https://forms.submitsecurity.com/webservice/ziplookup.php",
            contentAPI: "https://forms.submitsecurity.com/webservice/content.php",
            $step1Btn: $("#step1-btn"),
            $step1Holder: $('#step1-holder'),
            $step1Form: $("#step1-form"),
            $step2Btn: $('#step2-btn'),
            $step2Holder: $("#step2-holder"),
            $formHolder: $('.form-wrapper'),
            $successHolder: $(".contact-form"),
            $successMessage: '<div id="ty-wrapper"><h1>Thank you for requesting more information.</h1><p>A senior living advisor will be contacting you soon.</p><p>Click the button below to download your FREE Senior Living Guide.</p><a href="assets/files/The-Assisted-Living-Guide-from-AssistedLivingHelp.pdf" target="_blank" id="ebooksuccess"><button class="submit_btn btn btn-default" id="ty-btn">Download Guide</button></a><div class="start-over">Start Over</div></div>',
            $xOutMessage: '<div id="ty-wrapper"><h1>Thank you for interest.</h1><p>Unfortunately, based on your criteria, we were unable to match you with one of our communities at this time.</p><p>Click the button below to download your FREE Senior Living Guide.</p><a href="assets/files/The-Assisted-Living-Guide-from-AssistedLivingHelp.pdf" target="_blank" id="ebooksuccess"><button class="submit_btn btn btn-default" id="ty-btn">Download Guide</button></a><div class="start-over">Start Over</div></div>',
            $xOutMessageAlt: '<div id="ty-wrapper"><h1>Thank you for interest.</h1><p>We are determining if one of our communities will be a match for your needs. If we determine a good fit, we will contact you by phone or email.</p><p>Click the button below to download your FREE Senior Living Guide.</p><a href="assets/files/The-Assisted-Living-Guide-from-AssistedLivingHelp.pdf" target="_blank" id="ebooksuccess"><button class="submit_btn btn btn-default" id="ty-btn">Download Guide</button></a><div class="start-over">Start Over</div></div>',
            $noteligibleHolder: $("#noteligible-holder"),
            $statusCode: $("#status-code"),
            $citiesLoadIndicator: $("#load-cities-indicator"),
            leadDataObj: {zipcode:"00000"},
            baseURL: formBrain.buildBaseURL(window.location.host),
            conversionURL: typeof window._wsop_conversion_URL != 'undefined' ? window._wsop_conversion_URL : '//wsop.newclient.us/include/conversion.cfm',
            xOut: false,
            devMode: false,
            availableCities: ""
        };

        $.extend(formBrain.config, settings);
        formBrain.ready();
    },
    buildBaseURL: function(host){
        var url,pathArray = window.location.pathname.split('/');
            url = (host.indexOf("local") != -1) ? window.location.protocol.replace(/\:/g,'')+"://"+host+"/"+pathArray[1]+"/"+"public_html" : window.location.protocol.replace(/\:/g,'')+"://"+host;
        return url;
    },
    ready: function(){
        $.support.cors = true;
        $("#sourceurl").attr("value", window.location.href);
        if(formBrain.getParameterByName('src')){
            $.cookie('affiliatetracking', formBrain.getParameterByName('src'),{expires:1, path:'/'});
            $("#affiliatetracking").attr("value",  $.cookie('affiliatetracking'));
        } else if($.cookie('affiliatetracking')){
            $("#affiliatetracking").attr("value",  $.cookie('affiliatetracking'));
        }

        // If lead form has been completed, form will be hidden and success message shown
        // if ($.cookie('ALHsuccess')){
        //     formBrain.config.$formHolder.hide();
        //     if ($.cookie('ALHsuccess') == 'true') {
        //         formBrain.config.$successHolder.addClass('thank-you').append(formBrain.config.$successMessage);
        //     }
        //     else if ($.cookie('ALHsuccess') == 'false') {
        //         formBrain.config.$successHolder.addClass('thank-you').append(formBrain.config.$xOutMessage);
        //     }
        //     else {
        //         formBrain.config.$successHolder.addClass('thank-you').append(formBrain.config.$xOutMessageAlt);
        //     }
        // }

        // Handle Step 1 Button Click
        this.config.$step1Btn.click(function(e){
            e.preventDefault();
            e.stopImmediatePropagation()
            formBrain.processStep1();
        });
        // Handle Step 2 Button Click
        this.config.$step2Btn.click(function(e){
            e.preventDefault();
            e.stopImmediatePropagation();
            formBrain.processStep2();
        });

        // parse full name
        // $("#name").blur(function(e){
        //     e.stopImmediatePropagation();
        //     var fullname = $(this).val();
        //     var chunks = fullname.split(" ");
        //     if (chunks.length < 3) {
        //         $("#firstname").val(chunks[0]);
        //         $("#lastname").val(chunks[1]);
        //     }
        //     else {
        //         $("#firstname").val(chunks[0]);
        //         $("#lastname").val(chunks[2]); 
        //     }
        // });

        $("#phone").mask('(000) 000-0000');

        // $("#state").change(function(e){
        //     e.stopImmediatePropagation();
        //     var state = $(this).val();
        //     formBrain.getCitiesAndBuildList(state);
        // });
    },
    validateDate: function(testdate) {
            var date_regex = /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/ ;
            return date_regex.test(testdate);
    },
    processStep1: function(){
        formBrain.verifyCity($('#desiredCity').val());
        if (formBrain.verifyCity($('#desiredCity').val())) {
            var isValid = this.config.$step1Form.parsley().validate('block1');
        }

        if(isValid){
            formBrain.config.$step1Holder.hide();
            formBrain.config.$step2Holder.show();
            formBrain.trimCity($('#desiredCity').val());
            formBrain.zipLookup($('#desiredState').val(), $('#desiredCity').val(), '#desiredZipcode');

            // formBrain.scrollForm();
            formBrain.partOneComplete();

            window.ga('send', 'event', 'Funnel', 'Step 1', 'Complete');

            $('#firstname').focus();

            formBrain.config.$formHolder.removeClass('step1').addClass('step2');

            return false;
        }
    },
    processStep2: function(){
        var isValid = this.config.$step1Form.parsley().validate('block2');
        //isValid=true;
        if(isValid){
            var step2FormValues = {};
            $.each(this.config.$step1Form.serializeArray(), function(i, field) {
                step2FormValues[field.name] = field.value;
            });

            this.buildData(step2FormValues);

            // Preferred Payment Method (for X-Outs)
            this.checkXOut(); 

            this.processLead();

            window.ga('send', 'event', 'Funnel', 'Step 2', 'Complete');   
        }
    },
    processLead: function(){
        if(formBrain.config.devMode){
            alert("Dev Mode: Sorry, " + formBrain.config.leadDataObj.firstname + " your lead will NOT be processed.");
        } else {

        // fix for deprecated $.browser method
        jQuery.browser = {};
        jQuery.browser.msie = false;
        jQuery.browser.version = 0;
        if (navigator.userAgent.match(/MSIE ([0-9]+)\./)) {
            jQuery.browser.msie = true;
            jQuery.browser.version = RegExp.$1;
        }

        if (jQuery.browser.msie && window.XDomainRequest && parseInt(jQuery.browser.version, 10) <= 9) {
            // Use Microsoft XDR
            var xdr = new XDomainRequest();
            xdr.open("post", formBrain.config.leadAPI);
            xdr.onprogress = function(){
                formBrain.config.$statusCode.html("");
                formBrain.config.$step3Btn.html("Processing...").attr('disabled', true);
            };
            xdr.onload = function() {
                formBrain.config.$statusCode.append(xdr.responseText);
                formBrain.handleLeadStatus(jQuery("#returnstatus").val());
            };
            xdr.onerror = function(){
                alert("We're sorry, an error has occurred.  Please try again");
            };
            xdr.send(jQuery.param(formBrain.config.leadDataObj));
        } else {
            jQuery.ajax({
                type: 'POST',
                url: formBrain.config.leadAPI,
                data: formBrain.config.leadDataObj,
                crossDomain: true,
                beforeSend: function(){
                    formBrain.config.$statusCode.html("");
                    formBrain.config.$step2Btn.html("Processing...").attr('disabled', true);
                },
                error: function(jqXHR, data, errorThrown) {
                    console.log("errorThrown: "+ errorThrown);
                    alert("We're sorry, an error has occurred.  Please try again");
                },
                success: function(data){
                    formBrain.config.$statusCode.append(data);
                    formBrain.handleLeadStatus(jQuery("#returnstatus").val());
                }
            });
        }
        }


    },
    checkXOut: function(){
        if ($("#payment").val() == 'Medicaid') {
            $('#pa').val('xout-AL');
            formBrain.config.leadDataObj.pa = 'xout-AL';
            formBrain.config.xOut = true;
        }
    },
    handleLeadStatus: function(status){
       if(status === "200"){
            formBrain.fireFormComplete();

            // check if xOut
            // if (formBrain.config.xOut) {
            //     formBrain.fireFacebookXout();
            //     formBrain.config.$successHolder.addClass('thank-you').append(formBrain.config.$xOutMessage);
            //     $.cookie('ALHsuccess','false',{expires:1, path:'/'});
            // }
            // else if ($("#typeofhousing").val() == 'Nursing Home') {
            //     formBrain.googleAdConversionFire();
            //     window.ga('send', 'event', 'Conversion', 'Success', 'Nursing Home');
            //     formBrain.fireFacebookNursing();
            //     formBrain.config.$successHolder.addClass('thank-you').append(formBrain.config.$xOutMessageAlt);
            //     $.cookie('ALHsuccess','ok',{expires:1, path:'/'});
            // }
            // else {
            //     formBrain.googleAdConversionFire();
            //     window.ga('send', 'event', 'Conversion', 'Success', 'conversion');
            //     formBrain.fireFacebookConversion();
            //     formBrain.config.$successHolder.addClass('thank-you').append(formBrain.config.$successMessage);
                
            // }
            $.cookie('ALHsuccess','true',{expires:1, path:'/'});
            window.location.href = "thank-you.php";

           // if(formBrain.getParameterByName("clickid")){
           //  formBrain.fireAdKnowledge(formBrain.getParameterByName("clickid"));
           // }
           //formBrain.config.$successHolder.find("#personalize").html(formBrain.config.leadDataObj.firstname+",");
       } else if(status === "-500") {
           alert(formBrain.config.leadDataObj.firstname+", Looks like we already have your information");
           formBrain.config.$successHolder.addClass('thank-you').append(formBrain.config.$successMessage);
       } else {
           //alert("We're sorry, an error has occurred.  Please try again");
           formBrain.config.$successHolder.addClass('thank-you').append(formBrain.config.$successMessage);
       }
    },
    scrollForm: function(){
        if ($(window).width() < 481) {
            $.smoothScroll({
                scrollTarget: '.contact-form',
                speed: 1000
            });
        }
    },
    buildData: function(obj){
        $.each(obj, function(key, value){
            formBrain.config.leadDataObj[key] = value;
        });
    },
    getStateByZipcode: function(zipcode,field){
        $.ajax({
            type: 'GET',
            url: formBrain.config.zipcodeAPI+"?zip="+zipcode,
            dataType: 'jsonp',
            crossDomain: true,
            error: function(jqXHR, data, errorThrown) {
                alert("We're sorry, an error has occurred.  Please try again");
            },
            success: function(data){
                if(!data['notfound']){
                    $('#state').val(data.state);
                    formBrain.getCitiesAndBuildList(data.state, data.city, field);
                } else {
                    $('#zipcode').parent().append('<ul class="parsley-error-list"><li class="required" style="display: list-item;">Invalid zip code. Please try again</li></ul>');
                    $("#zipcode").val("").focus();
                }
            }
        });
    },
    getCitiesAndBuildList: function(state, city, field){
        $.ajax({
            type: 'GET',
            url: formBrain.config.citiesAPI+"?format=2&state="+state,
            //url: "http://172.25.49.140/IMS/forms.submitsecurity.com/public_html/webservice/cities.php?format=2&state="+state,
            dataType: 'jsonp',
            crossDomain: true,
            beforeSend: function(){
               // formBrain.config.$citiesLoadIndicator.css("display", "block");
            },
            error: function(jqXHR, data, errorThrown) {
                alert("We're sorry, an error has occurred.  Please try again");
            },
            success: function(data){
                var $city = $(field);
                    formBrain.config.availableCities = [];
                for (var i = 0; i < data.length; i++){
                    var options = data[i].option;
                    formBrain.config.availableCities.push(options);
                }

                $( "#desiredCity" ).autocomplete({
                    lookup: formBrain.config.availableCities,
                    autoSelectFirst: true,
                    // matches starting at the beginning of the string only
                    lookupFilter: function (suggestion, originalQuery, queryLowerCase) {
                        return suggestion.value.toLowerCase().indexOf(queryLowerCase) === 0
                    },
                    lookupLimit: 20
                });
                // console.log(availableCities)
                // $city.val(city);
                // formBrain.config.$citiesLoadIndicator.css("display", "none");
            }
        });
    },
    verifyCity: function(city) {
        city = city.trim();
        if(city.indexOf(",") != -1) {
            city = city.substring(0, city.indexOf(','));
        }
        if (formBrain.config.availableCities.indexOf( city ) > -1) {
            $('#desiredCity').removeClass('parsley-error');
            $('.location-city .parsley-errors-list').hide();
            return true;
        }
        else {
            $('#desiredZipcode').val('');
            $('#desiredCity').addClass('parsley-error');
            $('.location-city .parsley-errors-list').html('<li>Please check your city</li>').show();
            window.ga('send', 'event', 'Field Errors', 'Desired City', $('#desiredCity').val()+', '+$('#desiredState').val());
            return false;
        }
    },
    trimCity: function(city) {
        // Runs after step 1 to clear up trailing spaces or commas and states added to the city
        city = city.trim();
        $('#desiredCity').val(city);
        if(city.indexOf(",") != -1) {
            city = city.substring(0, city.indexOf(','));
            $('#desiredCity').val(city);
        }
    },
    zipLookup: function(state, city, field){
        $.ajax({
            type: 'GET',
            url: formBrain.config.zipLookupAPI+"?st="+state+"&city="+city+"&format=1",
            dataType: 'jsonp',
            crossDomain: true,
            error: function(jqXHR, data, errorThrown) {
                console.log("We're sorry, an error has occurred.  Please try again");
            },
            success: function(data){
                var $zip = $(field);
                $zip.val(data[0].zip);
            }
        });
    },
    appendContent: function(target, data){
        $(target).html(data);
        $(target).parent().show();
    },
    getParameterByName: function(name){
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
        return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    },
    partOneComplete: function(){
       if(typeof window._wsop_goal_conversion == 'function' && typeof window.wsop_code == 'object') {
        console.log("Part One Complete");
           window._wsop_goal_conversion('Part One Complete', window.wsop_code.getVisitID(), 0, formBrain.config.conversionURL);
       }
    },
    fireFormComplete: function(){
       if(typeof window._wsop_goal_conversion == 'function' && typeof window.wsop_code == 'object') {
        console.log("Form Complete");
          window._wsop_goal_conversion('Form Complete', window.wsop_code.getVisitID(), 0, formBrain.config.conversionURL);
       }
    },
    googleAdConversionFire: function () {
        var oldDocWrite = document.write;
        document.write = function (node) {
            $("body").append(node)
        }
        $.getScript("//www.googleadservices.com/pagead/conversion.js", function () {
            setTimeout(function () {
                document.write = oldDocWrite
            }, 100)
        });
    }, 
    fireFacebookConversion: function(){
        $("body").append('<img height="1" width="1" alt="" style="display:none" src="https://www.facebook.com/tr?ev=6020512007269&cd[value]=0.00&cd[currency]=USD&noscript=1" />');
    },
    fireFacebookNursing: function(){
        $("body").append('<img height="1" width="1" alt="" style="display:none" src="https://www.facebook.com/tr?ev=6021982749869&cd[value]=0.00&cd[currency]=USD&noscript=1" />');
    },
    fireFacebookXout: function(){
        $("body").append('<img height="1" width="1" alt="" style="display:none" src="https://www.facebook.com/tr?ev=6020512045669&cd[value]=0.00&cd[currency]=USD&noscript=1"  />');
    }
    // fireAdKnowledge: function(clickid){
    //       var request = new XMLHttpRequest();request.open('POST', 'https://forms.submitsecurity.com/webservice/adknowledge.php', true);
    //           request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    //           request.send("clickid="+clickid);
    // },
};

