module.exports = (grunt)->

    # Project configuration.
    grunt.initConfig
        watch:
            coffee:
                files: ['js/**/*.coffee']
                tasks: 'coffee'

            # jade:
            #     files: ['templates/**/*.jade']
            #     tasks: 'jade'

        coffee:
            srv:
                from: 'js'
                files: ['js/**/*.coffee']
                dest: 'js'

        # jade:
        #     templates:
        #         namespace: 'tmpl'
        #         files: ['templates/**/*.jade']
        #         dest: 'templates/templates.js'

    grunt.loadNpmTasks 'grunt-contrib-watch'

    # Default task.
    grunt.registerTask 'default', 'test'

    coffee  = require('coffee-script')
    path    = require('path')
    # jade    = require('jade')

    grunt.registerMultiTask 'coffee', 'Compile coffee', ()->
        files = grunt.file.expand this.data.files

        files.forEach (file)->
            coffeeCode = grunt.file.read(file)
            newPath = path.join path.dirname(file), path.basename(file, path.extname(file)) + '.js'

            jsCode = coffee.compile(coffeeCode)
            
            grunt.file.write(newPath, jsCode)
            grunt.log.ok 'Compiled coffee file: ' + file + ' at ' + grunt.template.today()

    # grunt.registerMultiTask 'jade', 'Compile jade', ()->
    #     files = grunt.file.expand this.data.files

    #     templates = 'var ' + @data.namespace + ' = ' + @data.namespace + ' || {};\n'
    #     templates += 'var jade = jade || require(\'jade\').runtime;\n\n\n'

    #     files.forEach (file)=>
    #         fileName = path.basename file, path.extname(file)
    #         jadeCode = grunt.file.read(file)
    #         jsFn = jade.compile(jadeCode, { client: true, compileDebug: false, filename: file }).toString()

    #         templates += '//==== '+@data.namespace+'.'+fileName+' ====//\n' + @data.namespace+'.' + fileName + ' = ' + jsFn.replace(' anonymous', '') + ';\n\n\n'

    #         # grunt.file.write(newPath, jsCode)
    #         grunt.log.ok('Compiled jade file: ' + file)

    #     templates += 'module.exports = ' + @data.namespace
        
    #     grunt.file.write(this.data.dest, templates)
    #     grunt.log.ok 'All files compiled correctly at ' + grunt.template.today()

    grunt.registerTask 'version', 'Update versipn file', (test)->
        pkg = grunt.config.get 'pkg'
        grunt.file.write 'VERSION', pkg.version + ' ' + grunt.template.today()
        grunt.log.ok 'File version updated'
  
    grunt.registerTask 'test', 'grunt test', ()->
        grunt.log.write 'Grunt file finded and no hava errors. Version grunt: ' + grunt.version + '\n'

