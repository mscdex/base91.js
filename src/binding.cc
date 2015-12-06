#include <node.h>
#include <node_buffer.h>
#include <nan.h>

#include <stdlib.h>
#include <math.h>

extern "C" {
#include "base91.h"
}

using namespace v8;

static void B91Encode(const Nan::FunctionCallbackInfo<v8::Value>& args) {
  Nan::HandleScope scope;
  struct basE91 b91;
  Local<String> result;

  if (args.Length() < 1)
    return Nan::ThrowTypeError("Missing data source (string or Buffer)");

  if (args[0]->IsString()) {
    String::Utf8Value data(args[0]);
    size_t datalen = data.length();
    if (datalen > 0) {
      char* obuf = (char*)malloc(floor(1.25 * datalen));
      basE91_init(&b91);
      int ototal = 0;
      char* ibuf = *data;
      ototal += basE91_encode(&b91, ibuf, datalen, obuf);
      ototal += basE91_encode_end(&b91, obuf + ototal);
      result = Nan::New<String>((const char*)obuf, ototal).ToLocalChecked();
      free(obuf);
    } else
      result = Nan::EmptyString();
  } else if (node::Buffer::HasInstance(args[0])) {
#if NODE_MAJOR_VERSION == 0 && NODE_MINOR_VERSION < 10
    Local<Object> buf = args[0]->ToObject();
#else
    Local<Value> buf = args[0];
#endif
    char* data = node::Buffer::Data(buf);
    size_t datalen = node::Buffer::Length(buf);

    if (datalen > 0) {
      char* obuf = (char*)malloc(floor(1.25 * datalen));
      basE91_init(&b91);
      int ototal = 0;
      ototal += basE91_encode(&b91, data, datalen, obuf);
      ototal += basE91_encode_end(&b91, obuf + ototal);
      result = Nan::New<String>((const char*)obuf, ototal).ToLocalChecked();
      free(obuf);
    } else
      result = Nan::EmptyString();
  } else
    return Nan::ThrowTypeError("Data source not string or Buffer");

  args.GetReturnValue().Set(result);
}

static void B91Decode(const Nan::FunctionCallbackInfo<v8::Value>& args) {
  Nan::HandleScope scope;

  if (args.Length() < 1)
    return Nan::ThrowTypeError("Missing string data source");

  if (args[0]->IsString()) {
    String::Utf8Value data(args[0]);
    size_t datalen = data.length();
    struct basE91 b91;
    if (datalen > 0) {
      char* obuf = (char*)malloc(datalen);
      basE91_init(&b91);
      size_t ototal = 0;
      ototal += basE91_decode(&b91, *data, datalen, obuf);
      ototal += basE91_decode_end(&b91, obuf + ototal);
      args.GetReturnValue().Set(Nan::NewBuffer(obuf, ototal).ToLocalChecked());
    } else
      args.GetReturnValue().Set(Nan::Null());
  } else
    Nan::ThrowTypeError("Data source not string");
}

extern "C" {
  void init(Handle<Object> target) {
    target->Set(Nan::New<String>("encode").ToLocalChecked(),
                Nan::New<FunctionTemplate>(B91Encode)->GetFunction());
    target->Set(Nan::New<String>("decode").ToLocalChecked(),
                Nan::New<FunctionTemplate>(B91Decode)->GetFunction());
  }

  NODE_MODULE(base91encdec, init);
}
