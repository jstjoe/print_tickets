/*global Blob*/
/*global URL*/

(function() {

  var checkbox1;
  var checkbox2;
  var checkbox3;

  return {
    events: {
      'app.created':'init',
      'click .displayList': 'startDL',
      'getTickets.done': 'results',
      'click .checkbox1': 'validateCheckbox',
      'click .checkbox2': 'validateCheckbox',
      'click .checkbox3': 'validateCheckbox',
    },

    requests: {
      printTicket: function(ticket_id){
        return{
          url: '/tickets/'+ ticket_id +'/print',
          type: 'GET',
          cors: true,
          contentType: 'text/html',
          success: function(data) {this.concatPrint(data, ticket_id);}
        };
      },

      getTickets: function(url){
        return {
          url: url
        };
      }
    },

    init: function(){
      this.switchTo('generate');
      this.tickets = [];
      this.ticketIds = [];
      this.userName = this.currentUser().name();
    },

    validateCheckbox: function(){
        if (this.$('#filterCheckbox1').is(':checked')){
         console.log(filterCheckbox1.value);
         this.checkbox1 = true;
        } else if (this.$('#filterCheckbox2').is(':checked')){
         console.log(filterCheckbox2.value);
         this.checkbox2 = true;
        } else if (this.$('#filterCheckbox3').is(':checked')) {
         console.log(filterCheckbox3.value);
         this.checkbox3 = true;
        }
      },

    startDL: function() {
      var searchQuery = encodeURIComponent( 'commenter:' + this.user().id() );
      var searchQueryRequester = encodeURIComponent( 'requester:' + this.user().id() );
      var searchQueryCC = encodeURIComponent( 'cc:' + this.user().id() );
      var initURL = '/api/v2/search.json?page=1&query=';
      var commenterSearch = '/api/v2/search.json?page=1&query=' + searchQuery;
      var requesterSearch = '/api/v2/search.json?page=1&query=' + searchQueryRequester;
      var ccSearch = '/api/v2/search.json?page=1&query=' + searchQueryCC;

      if (this.checkbox1 === true && this.checkbox2 === true && this.checkbox3 === true){
        console.log('all are checked.');
        this.switchTo('loading');
        this.ajax('getTickets', commenterSearch);
      } 
      
      if (this.checkbox1 === true){
        console.log('only 1');
        this.switchTo('loading');
        this.ajax('getTickets', commenterSearch);
      }

      if (this.checkbox2 === true){
        console.log('only 2');
        this.switchTo('loading');
        this.ajax('getTickets', requesterSearch);
      }

      if (this.checkbox3 === true){
        console.log('only 3');
        this.switchTo('loading');
        this.ajax('getTickets', ccSearch);
      }

      if (this.checkbox3 === false && this.checkbox1 === true && this.checkbox2 === true){
        console.log('1 & 2 are checked, 3 is not.');
        this.switchTo('loading');
        this.ajax('getTickets', requesterSearch);
      } 

      if (this.checkbox2 === false && this.checkbox1 === true && this.checkbox3 === true){
        console.log('1 & 3 are checked, 2 is not.');
        this.switchTo('loading');
        this.ajax('getTickets', ccSearch);
      }

      if (this.checkbox1 === false && this.checkbox2 === true && this.checkbox3 === true){
        console.log('2 & 3 are checked, 1 is not.');
        this.switchTo('loading');
        this.ajax('getTickets', ccSearch);        
      }
    },
//         this.ajax('getTickets', query); 
//         } else if (this.$('#filterCheckbox2').is(':checked')){
//         console.log('2nd one is clicked');
//         this.switchTo('loading');
//         this.ajax('getTickets', requesterSearch); 
//         } else if (this.$('#filterCheckbox3').is(':checked')) {
//         console.log('3rd one is clicked'); 
//         this.switchTo('loading');
//         this.ajax('getTickets', ccSearch);
//         } else {confirm('You made 0 selections, showing you everything.');
//       this.ajax('getTickets', initURL);
//       this.switchTo('loading');
//        }
// },


//       if (this.$('#filterCheckbox1').is(':checked')){
//         console.log('1st one is clicked');
//       var searchQuery = encodeURIComponent( 'commenter:' + this.user().id() );
//         initURL = '/api/v2/search.json?page=1&query=' + searchQuery;
//         this.ajax('getTickets', initURL);
//         this.switchTo('loading');
//       } else if (this.$('#filterCheckbox2').is(':checked')){
//         console.log('2nd one is clicked');
//         var searchQueryRequester = encodeURIComponent( 'requester:' + this.user().id() );
//         initURLRequester = '/api/v2/search.json?page=1&query=' + searchQueryRequester;
//       this.ajax('getTickets', initURLRequester);
//       this.switchTo('loading');
//       } else if (this.$('#filterCheckbox3').is(':checked')) {
//         console.log('3rd one is clicked');
//         var searchQueryCC = encodeURIComponent( 'cc:' + this.user().id() );
//         initURLCC = '/api/v2/search.json?page=1&query=' + searchQueryCC;
//       this.ajax('getTickets', initURLCC);
//       this.switchTo('loading');
//       } else {confirm('You made 0 selections, showing you everything.');
//       this.ajax('getTickets', initURL);
//       this.switchTo('loading');
//        }
// },

    results: function(data){
      var results = data.results,
        nextPage = data.next_page;
      results.forEach(function(x){
        this.ticketIds.push(x.id);
      }, this);
      if(nextPage !== null){
        this.ajax('getTickets', nextPage);
      } else {
        this.printForm();
      }
    },

    printForm: function(){
      this.ticketIds = _.uniq(this.ticketIds);
      this.ticketIds.forEach(function(x){
        this.ajax('printTicket', x);
      }, this);
    },

    concatPrint: function(data, ticket_id){
      data = data.replace('/images/zendesk-lotus-flower.png', 'http://ubercab.zendesk.com/images/zendesk-lotus-flower.png');
      this.tickets.push(data);
      if(this.ticketIds.length === this.tickets.length){
        this.createURL();
      }
    },

    createURL: function() {
      var blob = new Blob(this.tickets, {type : 'text/html'});
      var url = URL.createObjectURL( blob );
      this.switchTo('_ticketTemplate',{
        url: url,
        userName: this.userName
      });
    }

  };

}());
