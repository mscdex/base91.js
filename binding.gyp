{
  'targets': [
    {
      'target_name': 'base91encdec',
      'sources': [
        'src/binding.cc',
        'deps/base91/base91.c',
      ],
      'include_dirs': [
        'deps/base91',
        "<!(node -e \"require('nan')\")",
      ],
      'cflags': [ '-O3' ],
    },
  ],
}