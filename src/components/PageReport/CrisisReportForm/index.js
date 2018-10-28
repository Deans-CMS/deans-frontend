import React from "react";
import PropTypes from "prop-types";
import { Form, Input, Tooltip, Icon, Select, Button } from "antd";
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng
} from "react-places-autocomplete";

const FormItem = Form.Item;
const Option = Select.Option;

// const crisisType = [
//   "Casualty",
//   "Hazardous Air Condition",
//   "Fire Breakout",
//   "Gas Leaks",
//   "Crisis Not Listed"
// ];

// const assistanceType = [
//   "Emergency Ambulance",
//   "Rescue and Evacuation",
//   "Fire Fighting",
//   "Gas Leak Control",
//   "Assistance Not Listed"
// ];

const createSelectionList = obj =>
  Object.keys(obj).map((val, index) => (
    <Option value={val} key={index}>
      {obj[val]}
    </Option>
  ));

class CrisisReportForm extends React.Component {
  state = {
    confirmDirty: false,
    address: "",
    gps: null
  };

  handleChange = () => null; // dummy

  handleSelect = address => {
    geocodeByAddress(address)
      .then(results => {
        return getLatLng(results[0]);
      })
      .then(gps => {
        this.setState({ gps, address });
        this.props.form.setFieldsValue({
          location: address
        });
      })
      .catch(error => console.error("Error", error));
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        console.log("Received values of form: ", values);
        const {
          name,
          phone,
          location_2,
          crisisType,
          crisisDescription,
          assistanceType,
          assistanceDescription
        } = values;
        const form = new FormData();
        form.append("your_name", name);
        form.append("mobile_number", phone);
        if (crisisType && crisisType.length > 0) {
          for (const type of crisisType) {
            form.append("crisis_type", type);
          }
        }
        if (assistanceType && assistanceType.length > 0) {
          for (const type of assistanceType) {
            form.append("crisis_assistance", type);
          }
        }
        form.append("crisis_status", "PD");
        form.append("crisis_location1", JSON.stringify(this.state.gps)); // important because object makes no sense in REST
        form.append("crisis_location2", location_2);
        form.append("crisis_description", crisisDescription);
        // form.append("crisis_description", crisisDescription);
        console.log(form);
        for (const val of form) {
          console.log(val);
        }
      }
    });
  };

  handleConfirmBlur = e => {
    const value = e.target.value;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  };

  render() {
    const { getFieldDecorator } = this.props.form;

    const formItemLayout = {
      labelCol: {
        sm: { span: 4 }
      },
      wrapperCol: {
        sm: { span: 16 }
      }
    };
    const tailFormItemLayout = {
      wrapperCol: {
        xs: {
          offset: 0
        },
        sm: {
          offset: 4
        }
      }
    };
    const prefixSelector = getFieldDecorator("prefix", {
      initialValue: "65"
    })(
      <Select disabled style={{ width: 70 }}>
        <Option value="65">+65</Option>
      </Select>
    );

    return (
      <Form onSubmit={this.handleSubmit}>
        <FormItem
          {...formItemLayout}
          label={
            <span>
              Your Name&nbsp;
              <Tooltip title="Your real name">
                <Icon type="question-circle-o" />
              </Tooltip>
            </span>
          }
        >
          {getFieldDecorator("name", {
            rules: [
              {
                required: true,
                message: "Please input your name!",
                whitespace: true
              }
            ]
          })(<Input />)}
        </FormItem>
        <FormItem {...formItemLayout} label="Mobile Number">
          {getFieldDecorator("phone", {
            rules: [
              { required: true, message: "Please input your mobile number!" }
            ]
          })(<Input addonBefore={prefixSelector} style={{ width: "100%" }} />)}
        </FormItem>
        <FormItem {...formItemLayout} label={<span>Location</span>}>
          {getFieldDecorator("location", {
            rules: [
              {
                required: true,
                message: "Please input the location!",
                whitespace: true
              }
            ]
          })(
            <PlacesAutocomplete
              onChange={this.handleChange}
              onSelect={this.handleSelect}
            >
              {({
                getInputProps,
                suggestions,
                getSuggestionItemProps,
                loading
              }) => {
                return (
                  <React.Fragment>
                    <Input
                      {...getInputProps({
                        placeholder: "Search places..."
                      })}
                    />
                    <div className="autocomplete-dropdown-container">
                      {loading && <div>Loading...</div>}
                      {suggestions.map((suggestion, index) => {
                        const className = suggestion.active
                          ? "suggestion-item--active"
                          : "suggestion-item";
                        // inline style for demonstration purpose
                        const style = suggestion.active
                          ? { backgroundColor: "#fafafa", cursor: "pointer" }
                          : { backgroundColor: "#ffffff", cursor: "pointer" };
                        return (
                          <div
                            key={index}
                            {...getSuggestionItemProps(suggestion, {
                              className,
                              style
                            })}
                          >
                            <span>{suggestion.description}</span>
                          </div>
                        );
                      })}
                    </div>
                  </React.Fragment>
                );
              }}
            </PlacesAutocomplete>
          )}
        </FormItem>
        <FormItem {...formItemLayout} label={<span>Location 2</span>}>
          {getFieldDecorator("location_2", {
            rules: [
              {
                required: false,
                whitespace: true
              }
            ]
          })(<Input placeholder="Room number, block number, street name..." />)}
        </FormItem>
        <FormItem {...formItemLayout} label="Crisis Type">
          {getFieldDecorator("crisisType", {
            rules: [
              {
                type: "array",
                required: true,
                message: "Please select crisis type!"
              }
            ]
          })(
            <Select mode="multiple" placeholder="Select crisis type(s)">
              {createSelectionList(this.props.crisisType)}
            </Select>
          )}
        </FormItem>
        <FormItem {...formItemLayout} label="Crisis Description">
          {getFieldDecorator("crisisDescription", {
            rules: [{ required: false }]
          })(
            <Input
              style={{ width: "100%" }}
              placeholder="Anything we must know?"
            />
          )}
        </FormItem>
        <FormItem {...formItemLayout} label="Assistance Type">
          {getFieldDecorator("assistanceType", {
            rules: [
              {
                type: "array",
                required: false
              }
            ]
          })(
            <Select mode="multiple" placeholder="Select assistance(s) required">
              {createSelectionList(this.props.assistanceType)}
            </Select>
          )}
        </FormItem>
        <FormItem {...formItemLayout} label="Assistance Description">
          {getFieldDecorator("assistanceDescription", {
            rules: [{ required: false }]
          })(
            <Input
              style={{ width: "100%" }}
              placeholder="If you selected others, specify your assistance request here"
            />
          )}
        </FormItem>
        {/* <FormItem {...tailFormItemLayout}>
          {getFieldDecorator("agreement", {
            valuePropName: "checked",
            required: true
          })(
            <Checkbox>
              I understand that fake report is a breach of law and I will be
              arrested, fined and jailed.
            </Checkbox>
          )}
        </FormItem> */}
        <FormItem {...tailFormItemLayout}>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </FormItem>
      </Form>
    );
  }
}

CrisisReportForm.propTypes = {
  crisisType: PropTypes.array.isRequired,
  assistanceType: PropTypes.array.isRequired
};

export default Form.create()(CrisisReportForm);
