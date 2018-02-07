var familyTree = {
    pedigree: {
        data: {
            name: "Me",
            gender: "male",
            birth: "xx.xx.xxxx",
            adopted: true,
        },
        spouses: [{
            data: {
                name: "S1",
                gender: "female",
                birth: "xx.xx.xxxx",
                divorced: "true"
            },
            children: [{
                data: {
                    name: "Child 1",
                    gender: "male",
                    birth: "xx.xx.xxxx"
                }
            }, {
                data: {
                    name: "Child 2",
                    gender: "male",
                    birth: "xx.xx.xxxx"
                }
            }]
        }, {
            data: {
                name: "S1",
                gender: "female",
                birth: "xx.xx.xxxx",
                separated: "true"
            },
            children: [{
                data: {
                    name: "Child 1",
                    gender: "male",
                    birth: "xx.xx.xxxx"
                }
            }, {
                data: {
                    name: "Child 2",
                    gender: "male",
                    birth: "xx.xx.xxxx"
                }
            }]
        }, {
            data: {
                name: "S1",
                gender: "female",
                birth: "xx.xx.xxxx"
            },
            children: [{
                data: {
                    name: "Child 1",
                    gender: "unknown",
                    birth: "xx.xx.xxxx"
                }
            }, {
                data: {
                    name: "Child 2",
                    gender: "male",
                    birth: "xx.xx.xxxx"
                }
            }, {
                data: {
                    name: "Child 3",
                    gender: "female",
                    birth: "xx.xx.xxxx"
                }
            }]
        }]
    },
    siblings2: [{
        data: {
            name: "Brother 1",
            gender: "male",
            birth: "xx.xx.xxxx",

        },
    }],
    siblings1: [{
        data: {
            name: "Brother 1",
            gender: "male",
            birth: "xx.xx.xxxx",
            twin: true
        },
        spouses: [{
            data: {
                name: "Brother 1s spouse",
                gender: "female",
                birth: "xx.xx.xxxx"
            },
            children: [

                {
                    data: {
                        name: "Brother 1s daughter 2",
                        gender: "male",
                        birth: "xx.xx.xxxx",
                        twin: true
                    },
                    spouses: [{
                        data: {
                            name: "Brother 1s spouse",
                            gender: "female",
                            birth: "xx.xx.xxxx"
                        },
                        children: [

                            {
                                data: {
                                    name: "Brother 1s brother 1",
                                    gender: "male",
                                    birth: "xx.xx.xxxx",

                                },
                            }, {
                                data: {
                                    name: "Brother 1s daughter 2",
                                    gender: "female",
                                    birth: "xx.xx.xxxx",
                                    twin: true,
                                    identical: true
                                }
                            }, {
                                data: {
                                    name: "Brother 1s brother 1",
                                    gender: "male",
                                    birth: "xx.xx.xxxx",
                                    twin: true,
                                    identical: true,
                                },
                            },

                            {
                                data: {
                                    name: "Brother 1s brother 1",
                                    gender: "male",
                                    birth: "xx.xx.xxxx",

                                },
                            },
                        ]
                    }]
                },

                {
                    data: {
                        name: "Brother 1s brother 1",
                        gender: "male",
                        birth: "xx.xx.xxxx",
                        twin: true
                    },

                },

                {
                    data: {
                        name: "Brother 1s brother 1",
                        gender: "male",
                        birth: "xx.xx.xxxx",

                    },
                }, {
                    data: {
                        name: "Brother 1s brother 1",
                        gender: "male",
                        birth: "xx.xx.xxxx",

                    },
                },

            ]
        }]
    }, {
        data: {
            name: "Brother 2",
            gender: "male",
            birth: "xx.xx.xxxx",
            twin: true
        },
        spouses: [{
            data: {
                name: "S2",
                gender: "female",
                birth: "xx.xx.xxxx",
                divorced: "true"
            },
            children: [{
                data: {
                    name: "Brother 2s daughter 1",
                    gender: "female",
                    birth: "xx.xx.xxxx",
                    abortion: true
                }
            }, {
                data: {
                    name: "Brother 2s daughter 2",
                    gender: "female",
                    birth: "xx.xx.xxxx"
                }
            }, {
                data: {
                    name: "Brother 2s son",
                    gender: "male",
                    birth: "xx.xx.xxxx"
                }
            }]
        }]
    }],
    father: {
        data: {
            name: "Father",
            gender: "male",
            birth: "xx.xx.xxxx",
            deceased: true,
        }
    },
    mother: {
        data: {
            name: "Mother",
            gender: "female",
            birth: "xx.xx.xxxx",
            deceased: true,
        },
        father: {
            data: {
                name: "Grandfather",
                gender: "male",
                birth: "xx.xx.xxxx"
            },
            father: {
                data: {
                    name: "Great-grandfather",
                    gender: "male",
                    birth: "xx.xx.xxxx",
                    death: "yy.yy.yyyy"
                }
            },
            mother: {
                data: {
                    name: "Great-grandmother",
                    gender: "female",
                    birth: "xx.xx.xxxx",
                    death: "yy.yy.yyyy"
                }
            }
        },
        mother: {
            data: {
                name: "Grandmother",
                gender: "female",
                birth: "xx.xx.xxxx"
            },
            father: {
                data: {
                    name: "Great-grandfather",
                    gender: "male",
                    birth: "xx.xx.xxxx",
                    death: "yy.yy.yyyy"
                }
            },
            mother: {
                data: {
                    name: "Great-grandmother",
                    gender: "female",
                    birth: "xx.xx.xxxx",
                    death: "yy.yy.yyyy"
                }
            }
        }
    },


};
