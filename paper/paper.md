---
title: 'SNIK Graph---Visualizing Knowledge about Management of Hospital Information Systems'
tags:
  - JavaScript
  - information management
  - hospital information system
  - visualization
  - linked data
authors:
  - name: Konrad Höffner
    orcid: 0000-0001-7358-3217
    affiliation: 1
  - name: Thomas Pause
    orcid: 0000-0001-5832-4890
    affiliation: 1
  - name: Franziska Jahn
    orcid: 0000-0002-7687-8544}
    affiliation: 1
  - name: Anna Brakemeier
    affiliation: 1
  - name: Alfred Winter
    orcid: 0000-0003-0179-954X
    affiliation: 1
affiliations:
 - name: Institute for Medical Informatics, Statistics and Epidemiology, Medical Faculty, Leipzig University
   index: 1
date: 3 February 2022
bibliography: paper.bib

---

# Summary
[@cytoscapejs]
Medical and health informatics integrates knowledge of business information systems, computer science and medicine.
As a comparatively young research discipline, it lacks a uniform terminology, especially for describing health information systems and their management.
Several textbooks provide different perspectives of the discipline but the linear struture inherent in a book does not intuitively convey the highly connected nature of the concepts of the domain.
SNIK, the semantic network of information management in hospitals, is an ontology that combines the knowledge of three textbooks, the IT4IT standard and an interview with a hospital CIO.
Graph-based visualizations allow teachers to intuitively convey relationships between a selection of those concepts and also allow students to explore the domain on their own [@ontologybased].

We present SNIK Graph, a web-based client-side open-source Linked Data visualization for both classes and instances that is optimized for teaching and studying knowledge about the management of health information systems.
Due to the large amount of concepts and relationships, visualizing SNIK as a graph causes overplotting, which we solve using filters, searches and exploratory operations. 


There are several existing graph-based Linked Data visualizations [@linkeddatavisualization], which visualize RDF resources (classes or instanes) as nodes and their relationships as edges, but they do not fit our requirements [@visualizationoflargeontologies].
Our contribution is SNIK Graph, a web application\footnote{\url{http://www.snik.eu/graph}} that offers Linked Data visualization for both classes and instances and according to the requirements of SNIK and its users.
With the thousands of classes of SNIK, graph-based visualization suffers from overplotting.
Thus, SNIK Graph offers several options to select and layout subgraphs, for example to show only a specific chapter of a book to prepare a lecture about a specific topic.
Users can also iteratively explore SNIK starting at a single class using neighbourhood and path operations. %(see \autoref{fig:snik-graph-circle-star})

# Statement of need

# Acknowledgements
This work is supported by the DFG (German Research Foundation) under the Project SNIK, Grant no. 1605/7-1 and 1387/8-1.

# References

% SNIK Graph is presented in poster form at \cite{snikgraphposter}.

## Design Goals and Requirements
Our main goal is to visualize knowledge extracted from text books to users that may not have any Semantic Web experience.
The time and cognitive load of the users required to install, learn and operate the application should be as low as possible, so that they can focus on the data at hand and experience a benefit compared to only reading the textbook, such as when studying for an exam.
A web application is easiest to set up for the user, as it is operating system agnostic and does not need to be installed.




# Implementation and Setup
As none of the investigated existing approaches support all our use cases and design goals and provide adequate performance on more than 4000 nodes, we implemented SNIK Graph as a web application using JavaScript (EcmaScript 2015) based on the graph visualization library Cytoscape.js [@cytoscape].
SNIK Graph is freely available as open source software\footnote{\url{https://github.com/imise/snik-cytoscape.js}}.
As a client-side tool\footnotemark{}, SNIK Graph can be adapted for other knowledge bases and ontologies and published on any HTML web server by cloning the repository, installing the NPM dependencies and adapting the configuration file settings including the SPARQL endpoint URL.
\footnotetext{Aside from a SPARQL endpoint.}%
An installation containing SNIK is published at <https://www.snik.eu/graph> as well as <https://snikproject.github.io/snik-graph>.

# Features
 
Users can group interlinked nodes together and either display them side by side or on top of each other, see \autoref{fig:combine}.
As SNIK consists of more than 4000 classes, viewing large parts of it at once does not convey much information.%, see \autoref{fig:much}.
To alleviate this, SNIK offers multiple exploration methods described in the following.


## Role Use

A frequent question is, what a given role does and which information is needed for those functions represented by the entity types connected to those functions.
This question is visually answered by the "role use" feature, which arranges roles, functions and entity types in concentric circles, see \autoref{fig:classuse}:
    includegraphics class-use-project-manager.pdf
    caption{\emph{Role Use} of {bb}{ProjectManager}. Outermost layer ommitted due to space limitiations.}\label{fig:classuse}


##{Search}
    search.pdf
    caption{Visual search results for "Chief Information Officer" in a part of SNIK.}\label{fig:search}

Due to the large amount of resources, exploration often begins with a search.
The search index is populated from the target SPARQL endpoint and is implemented using the Fuse.js library that is based on the Baeza-Yates--Gonnet algorithm [@textsearching].
Fuse.js\footnotemark{} is a light-weight, purely client side JavaScript library and presents an alternative to backend-driven indexes like Lucene.%
\footnotetext{\url{https://fusejs.io/}, \url{https://github.com/krisk/Fuse}}
This enables fast fuzzy search on any dataset loaded via SPARQL endpoint but requires waiting for index initialization on the first search of each user session.
Search results presented to the user are color coded in three categories: visible (green), invisible (yellow)%
\footnote{The resource is either \emph{filtered} or \emph{hidden}.}% \autoref{sec:visibility}
 and not loaded (red)%
\footnote{The resource is included in the search index built from the SPARQL endpoint but either deleted in the graph or not loaded in the first place, such as due to configuration.}.
Each search entry of a class contains the label values of {rdfs}{label} (long form) and {skos}{altLabel} (short and alternative forms) with a weight of 0.7.
Textbook definitions are included with a weight of 0.3.
Labels of resources connected via {skos}{closeMatch} interlinks in either direction are included as well, because those resources are defined as semantically close, so we assume their labels are synonyms.
Fuzzy matching is enabled with a threshold of 0.25.
The resource {bb}{ChiefInformationOfficer} can thus be found by entering either "CIO" (alternative label), "vice president" (part of the definition) or "Leiter des Rechenzentrums" (German alternative label of {ob}{ChiefInformationOfficer}).
Search results are then selected in the graph, see~\autoref{fig:search}, which allows further exploration by chaining the path and neighbourhood operations described in following.

![The shortest non-trivial path between Chief Information Officer and Planning of Staff.\label{fig:path}](img/path.png)

The shortest path is the most basic method of visualizing the relationship between two resources, see \autoref{fig:path}.
We treat SNIK as an undirected graph for the calculation because the direction is often arbitrary.
Roles can be nested using {meta}{roleComponent} (\emph{has part}), which could have just as well been modelled as a \emph{part of} relation with reversed subject and object.
Another reason is that a set of resources that forms a graph connected by some symmetric property implies a complete subgraph, which negatively effects speed, memory and visibility of SNIK Graph.
For this reason, {skos}{closeMatch} and other symmetrical properties are often only sparsely modelled, and the other triples are implied.
As SPARQL endpoints, such as Virtuoso SPARQL employed by SNIK, do not perform reasoning to infer such implied triples such as those generated by symmetric properties, this would prevent the shortest path from including resources where only the opposite direction is explicitly modelled.%

We also don't explicitly store triples inferred by transitive properties such as {rdfs}{subClassOf}, which prevents paths involving such properties from being squashed, such as the path between \emph{Project Manager} and \emph{HIS Stakeholder} in \autoref{fig:hierarchy}.

%We ignore the direction of edges because, that is, which resource is the subject and the object 
The largest problem of shortest paths is however, that they are not necessarily informative to the user. 
For example, any two roles, such as {bb}{ChiefInformationOfficer} and {bb}{ChiefExecutiveOfficer}, are connected by a path of length 2 as they are all subclasses of {meta}{Role}, which the user already knows given the triangular shapes representing roles in SNIK Graph.
To exclude such trivial paths,  the meta model is not shown by default.
Furthermore, filtering, such as by knowledge source or type of relation or resource, allows further tuning of the resources that are shown and eliglible for paths.
%Further research into informative paths has been done in two bachelor theses [@].
An general approach to solve the problem of informative shortest paths is \emph{weighted shortest paths for RDF graphs (WiSP)} [@wisp].
Future work includes adopting this approach to SNIK Graph and evaluating it with its users.
Another approach is to show all short paths under a given length and let the user remove unwanted ones manually, as employed by \emph{Relfinder} [@relfinder].

## Neighbourhood Operations
Exploration using neighbours, that is the successive uncovering of nodes adjacent to a starting node given by a user, is a common feature of tools such as \cite{lodlive} and \cite{vizlod}.%
## Star
The directed and undirected star operations show nodes connected to selected nodes via all paths that contain at most one property other than {skos}{closeMatch}.
The \emph{circle star} also rearranges the nodes using the force-directed layout locally on the currently visible subgraph.
\autoref{fig:star} shows a mind map of strategic information management, created by an undirected star, which can be used by a teacher to prepare a lecture about the topic.
![*Star* of the 3LGM²-S model for service oriented communication.\label{fig:star}](img/star.png)

The concept \emph{project management} both exists in a textbook [@ob] and in the knowledge about information management in a German university hospital.
Grouping both concepts with the help of the star function the user detects that the terms have a different meaning according to their neighboorhood terms.
Whereas the text book deals with the management of single projects, in the CIO's world "project management" means managing multiple projects, as shown in the lower right container in \autoref{fig:tabs}.
As all neighbourhood and path operations automatically select all resulting nodes, repeated application of a star without clearing the selection results in an incremental uncovering of the whole connected graph around the starting node.

## Mixed Operations
### Spiderworm
A \emph{spiderworm} is a path from node \emph{A} to node \emph{B} combined with a \emph{star} of \emph{B}.
\autoref{fig:spiderworm} shows how we use a spiderworm to teach a student how the new concept "quality of data" is connected the the already introduced concept "patient identification number."

![*Spiderworm* from *Application System* to *Application Component*.\label{fig:spiderworm}](img/spiderworm.png)

### Conclusions and Future Work
With SNIK Graph, we implement an adaptable open-source client-side graph-based Linked Data visualization that supports both A-Boxes and T-Boxes covering 11 of the 15 use cases presented in [@linkeddatavisualization].
We publish an installation visualizing the SNIK ontology and use it for teaching and self-learning of HIS management.
SNIK Graph is easy to setup and can be configured to visualize other knowledge bases and ontologies.  
Our main focus on improvement is the performance, which is mostly adequate on more than 4000 nodes, but suffers in two key areas:

The single-thread paradigm of JavaScript seriously hinders performance of CPU-bound applications like SNIK Graph.
While SNIK Graph does not require perfectly smooth motion and wild movements are not a common usage pattern, stuttering is still frustrating to users especially on less performant CPUs and browsers other than Chrome and contrary to our goal of minimizing friction for users. 
implementing an OpenGL-based renderer for Cytoscape.js has the potential to dramatically increase render speed.


# Figures

Figures can be included like this:
![Caption for example figure.\label{fig:example}](figure.png)
![Caption for example figure.\label{fig:example}](star.png)
![Caption for example figure.\label{fig:example}](img/star.png)
and referenced from text using \autoref{fig:example}.

Figure sizes can be customized by adding an optional second parameter:
![Caption for example figure.](figure.png){ width=20% }
