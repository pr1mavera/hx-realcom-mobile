/**
 * analytics 
 */
(function(window, factory) {
    var { fp, http } = factory()
    debugger
})(window, function() {
    'use strict'
    /**
     * http module
     */
    var http = (function() {
        function createFetch(url, method, params) {
            return fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: params ? JSON.stringify(params) : ''
            })
        }

        return {
            get: function(url, error) {
                    return createFetch(url, 'get')
                            .then(function(res) {
                                return (res.status === 200)
                                        ? res.json()
                                        : res.text().then(function(text){
                                            return error
                                                    ? error(text)
                                                    : Promise.reject(new Error(`${url}-->${text}-->${res.status}`))
                                        })
                            })
            },
            post: function(url, data, error) {
                    return createFetch(url, 'post', data)
                            .then(function(res) {
                                return (res.status === 200)
                                        ? res.json()
                                        : res.text().then(function(text){
                                            return error
                                                    ? error(text)
                                                    : Promise.reject(new Error(`${url}-->${text}-->${res.status}`))
                                        })
                            })
            }
        }
    })()

    /**
     * functional-programming module
     */
    var fp = (function() {
        // ************************************

        const trace = function(tag) {
            return function log(x) {
                console.log(tag, x)
                return x
            }
        }

        const filterOut = function(predicateFn, arr) {
            return filterIn( not( predicateFn ), arr )
        }

        const unary = function(fn) {
            return function onlyOneArg(arg) {
                return fn( arg )
            }
        }

        const not = function(predicate) {
            return function negated(...args) {
                return !predicate( ...args )
            }
        }

        const reverseArgs = function(fn) {
            return function argsReversed(...args) {
                return fn( ...args.reverse() )
            }
        }

        const spreadArgs = function(fn) {
            return function spreadFn(argsArr) {
                return fn( ...argsArr )
            }
        }

        const partial = function(fn, ...presetArgs) {
            return function partiallyApplied(...laterArgs) {
                return fn( ...presetArgs, ...laterArgs )
            }
        }

        const partialRight = function(fn, ...presetArgs) {
            return function partiallyApplied(...laterArgs) {
                return fn( ...laterArgs, ...presetArgs )
            }
        }

        const curry = function(fn, arity = fn.length) {
            return (function nextCurried(prevArgs) {
                return function curried(nextArg) {
                    var args = [ ...prevArgs, nextArg ]

                    return args.length >= arity
                            ? fn( ...args )
                            : nextCurried( args )
                }
            })( [] )
        }

        const uncurry = function(fn) {
            return function uncurried(...args) {
                var ret = fn

                for (let i = 0; i < args.length; i++) {
                    ret = ret( args[i] )
                }

                return ret
            }
        }

        const zip = function(arr1, arr2) {
            var zipped = []
            arr1 = [...arr1]
            arr2 = [...arr2]

            while (arr1.length > 0 && arr2.length > 0) {
                zipped.push( [ arr1.shift(), arr2.shift() ] )
            }

            return zipped
        }

        const compose = function(...fns) {
            return fns.reduceRight( function reducer(fn1, fn2) {
                return function composed( ...args ) {
                    return fn2( fn1( ...args ) )
                }
            } )
        }

        const prop = function(name, obj) {
            return obj[name]
        }

        const first = function(arr) {
            return arr[0]
        }

        const last = function(arr) {
            return arr[arr.length - 1]
        }

        const setProp = function(name, obj, val) {
            var o = Object.assign( {}, obj )
            o[name] = val
            return o
        }

        const unboundMethod = function(methodName, argCount = 2) {
            return curry(
                (...args) => {
                    var obj = args.pop()
                    return obj[methodName]( ...args )
                },
                argCount
            )
        }

        const pipe = reverseArgs(compose)

        // curried list operators
        const map = unboundMethod( 'map', 2 )
        const filter = unboundMethod( 'filter', 2 )
        const filterIn = filter
        const reduce = unboundMethod( 'reduce', 3 )
        const each = unboundMethod( 'forEach', 2 )
        const flatMap = curry( function flatMap(mapperFn, arr) {
            return arr.reduce( function reducer(list, v) {
                return list.concat( mapperFn( v ) )
            }, [] )
        } )

        return {
            trace,
            filterOut,
            unary,
            not,
            reverseArgs,
            spreadArgs,
            partial,
            partialRight,
            curry,
            uncurry,
            zip,
            compose,
            prop,
            first,
            last,
            setProp,
            unboundMethod,
            pipe,
            map,
            filter,
            filterIn,
            reduce,
            each,
            flatMap
        }
    })()

    return {
        fp,
        http
    }
})