if Meteor.isClient
    Meteor.startup ->
        solsort_require('./blobshot').run()
