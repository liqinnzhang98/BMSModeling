package com.example.demo.model;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity

@Table(name = "controller")
public class Controller {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "name")
    private String name;
    @ElementCollection
    private List<Long> inputOrder = new ArrayList<>();

    @ElementCollection
    private List<Long> outputOrder = new ArrayList<>();
    @OneToMany(mappedBy = "controller", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<Input> inputList;
    @OneToMany(mappedBy = "controller", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<Output> outputList;
    @Column(name = "model_number")
    private String modelNumber;
    @Column(name = "configuration")
    private String configuration;

    private boolean useAsTemplate = false;

    private boolean isCreatedFromTemplate = false;

    private String templateName;

    private String templateCreatedFrom = "origin";

    private Date dateCreated;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User author;

    @ManyToOne
    @JoinColumn(name = "parent_controller_id") // Customize the FK column name
    private Controller parentController;

    private List<Long> childControllers = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToMany(mappedBy = "controllers")
    private List<Spreadsheet> spreadsheets = new ArrayList<>();

    public void setId(Long id) {
        this.id = id;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<Input> getInputList() {
        return inputList;
    }

    public void setInputList(List<Input> inputList) {
        this.inputList = inputList;
    }

    public List<Output> getOutputList() {
        return outputList;
    }

    public void setOutputList(List<Output> outputList) {
        this.outputList = outputList;
    }

    public String getModelNumber() {
        return modelNumber;
    }

    public void setModelNumber(String modelNumber) {
        this.modelNumber = modelNumber;
    }

    public String getConfiguration() {
        return configuration;
    }

    public void setConfiguration(String configuration) {
        this.configuration = configuration;
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public List<Long> getOutputOrder() {
        return outputOrder;
    }

    public void setOutputOrder(List<Long> outputOrder) {
        this.outputOrder = outputOrder;
    }

    public List<Long> getInputOrder() {
        return inputOrder;
    }

    public void setInputOrder(List<Long> inputOrder) {
        this.inputOrder = inputOrder;
    }

    public boolean isUseAsTemplate() {
        return useAsTemplate;
    }

    public void setUseAsTemplate(boolean useAsTemplate) {
        this.useAsTemplate = useAsTemplate;
    }

    public String getTemplateName() {
        return templateName;
    }

    public void setTemplateName(String templateName) {
        this.templateName = templateName;
    }

    public Controller getParentController() {
        return parentController;
    }

    public void setParentController(Controller parentController) {
        this.parentController = parentController;
    }

    public User getAuthorId() {
        return this.author;
    }

    public void setAuthorId(User author) {
        this.author = author;
    }

    public String getTemplateCreatedFrom() {
        return templateCreatedFrom;
    }

    public void setTemplateCreatedFrom(String templateCreatedFrom) {
        this.templateCreatedFrom = templateCreatedFrom;
    }

    public Date getDateCreated() {
        return dateCreated;
    }

    public void setDateCreated(Date dateCreated) {
        this.dateCreated = dateCreated;
    }

    public User getAuthor() {
        return author;
    }

    public void setAuthor(User author) {
        this.author = author;
    }

    public boolean getIsCreatedFromTemplate() {
        return isCreatedFromTemplate;
    }

    public void setIsCreatedFromTemplate(boolean createdFromTemplate) {
        this.isCreatedFromTemplate = createdFromTemplate;
    }

    public List<Long> getChildControllers() {
        return childControllers;
    }

    public void setChildControllers(List<Long> childControllers) {
        this.childControllers = childControllers;
    }
}
